# hexo-deployer-pulumi

A plugin for the [Hexo](http://hexo.io/) static-site generator that uses Pulumi to publish to Amazon S3.


## Dependencies

- Hexo 6.x
- Pulumi 3.x


## Installation

``` bash
$ npm install hexo-deployer-pulumi --save
```

## Options

You can configure this plugin in Hexo's `_config.yml`.

``` yaml
deploy:
  type: pulumi
  bucket: <S3 bucket>
  region: <AWS region>
  project: <Pulumi project>
  stack: <Pulumi stack>
```

**Options:**

- **bucket**: the name of the S3 bucket you want to use. Defaults to `hexo-website`
- **region**: the AWS region to use. Defaults to `us-east-1`
- **project**: the name of the Pulumi project to create. Defaults to `hexo-website`
- **stack**: the name of the Pulumi stack to create. Defaults to `public`


If you have installed Pulumi and the AWS command-line tool and provided your credentials via `aws configure`,
this plugin will reuse those credentials.


## Contributors

- Troy Howard ([thoward](https://github.com/thoward))

## License

MIT
