const fs = require('fs')
const mime = require('mime-types'); 
const path = require("path");
const pulumi = require("@pulumi/pulumi");
const auto = require("@pulumi/pulumi/automation");
const aws = require("@pulumi/aws");

module.exports = async function(args) {

    // handle args from _config.yml
    if (!args.hasOwnProperty('bucket')) {
        args.bucket = 'hexo-website';
    }

    if (!args.hasOwnProperty('region')) {
        args.region = 'us-east-1';
    }

    if (!args.hasOwnProperty('stack')) {
        args.stack = 'hexo-website';
    }

    if (!args.hasOwnProperty('project')) {
        args.project = 'public';
    }

 
    const contentDir = this.public_dir;

    // Define our stack
    const stackArgs = {
        stackName: args.stack,
        projectName: args.project,
        program: async () => {

            // set up the bucket and necessary permissions
            const bucket = new aws.s3.Bucket(args.bucket, {
                website: {
                    indexDocument: "index.html",
                },
            });

            const ownershipControls = new aws.s3.BucketOwnershipControls("ownership-controls", {
                bucket: bucket.id,
                rule: {
                    objectOwnership: "ObjectWriter"
                }
            });

            const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("public-access-block", {
                bucket: bucket.id,
                blockPublicAcls: false,
            });

            // iterate over website files, creating bucket objects for them
            fs.readdirSync(contentDir, {withFileTypes: true, recursive: true}).forEach(file => {
                const fullPath = path.join(file.path, file.name);
                const relPath = path.join(path.relative(contentDir, file.path), file.name);
                const mimeType = mime.lookup(fullPath);
                if (file.isFile()) {
                    // create bucket object from file
                    const bucketObject = new aws.s3.BucketObject(relPath, {
                        bucket: bucket.id,
                        source: new pulumi.asset.FileAsset(fullPath),
                        contentType: mimeType,
                        acl: "public-read",
                    }, { dependsOn: publicAccessBlock });
                }
            })


            const bucketEndpoint = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
            return {
                websiteUrl: bucketEndpoint
            }
        }
    };

    // create (or select if one already exists) a stack that uses our inline program
    console.info("initializing stack...");
    const stack = await auto.LocalWorkspace.createOrSelectStack(stackArgs);
    console.info("successfully initialized stack");

    console.info("setting up config...");
    await stack.setConfig("aws:region", { value: "us-west-2" });
    console.info("config set");

    console.info("refreshing stack...");
    await stack.refresh({ onOutput: console.info });
    console.info("refresh complete");

    console.info("updating stack...");
    const updateResult = await stack.up({ onOutput: console.info });
    console.info(`update summary: \n${JSON.stringify(updateResult.summary.resourceChanges, null, 4)}`);

    console.info(`website url: ${updateResult.outputs.websiteUrl.value}`);
};

