# [Ghost 3.X](https://github.com/TryGhost/Ghost) on [Heroku](http://heroku.com)

Ghost is a free, open, simple blogging platform. Visit the project's website at <http://ghost.org>, or read the docs on <http://support.ghost.org>.

[![GitHub issues](https://img.shields.io/github/issues/SNathJr/ghost-on-heroku)](https://github.com/SNathJr/ghost-on-heroku/issues)
[![GitHub forks](https://img.shields.io/github/forks/SNathJr/ghost-on-heroku)](https://github.com/SNathJr/ghost-on-heroku/network)
[![GitHub stars](https://img.shields.io/github/stars/SNathJr/ghost-on-heroku)](https://github.com/SNathJr/ghost-on-heroku/stargazers)

## Disclaimer

This is a fork with some improvements from https://github.com/cobyism/ghost-on-heroku. I have forked and improved this repository as the original developer seemed to have abandoned his repo recently. In this repository I have upgraded ghost to ghost 3.X and added cloudinary as a free storage alternative to amazon's s3. If you are still interested with the ghost 1.0 version please visit the original repository.

## Ghost version 3.X

The latest release of Ghost is now supported! Changes include:

- Requires MySQL database, available through either of two add-ons:
  - [JawsDB](https://elements.heroku.com/addons/jawsdb) (deploy default)
  - [ClearDB](https://elements.heroku.com/addons/cleardb)
- `PUBLIC_URL` config var renamed to `APP_PUBLIC_URL` to give it alphabetical precedence
- The app is configured to use `Cloudinary File Storage` by default.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### step-by-step tutorial

The following video is a step by step tutorial:

[![thumbnail](https://img.youtube.com/vi/cODvhXMHgYI/0.jpg)](https://www.youtube.com/watch?v=cODvhXMHgYI)

### Things you should know

After deployment,

- First, visit Ghost at `https://YOURAPPNAME.herokuapp.com/ghost` to set up your admin account
- The app may take a few minutes to come to life
- Your blog will be publicly accessible at `https://YOURAPPNAME.herokuapp.com`
- If you subsequently set up a [custom domain](https://devcenter.heroku.com/articles/custom-domains) for your blog, you’ll need to update your Ghost blog’s `APP_PUBLIC_URL` environment variable accordingly
- If you create a lot of content or decide to scale-up the dynos to support more traffic, a more substantial, paid database plan will be required.

#### 🚫🔻 Do not scale-up beyond a single dyno

[Ghost does not support multiple processes.](https://docs.ghost.org/faq/clustering-sharding-multi-server/)

If your Ghost app needs to support substantial traffic, then use a CDN add-on:

- [Fastly](https://elements.heroku.com/addons/fastly)
- [Edge](https://elements.heroku.com/addons/edge).

#### Configuring S3 file uploads

The blog is configured to use Cloudinary file storage by default. If you want to configure S3 file storage, create an S3 bucket on Amazon AWS, and then specify the following details as environment variables on the Heroku deployment page (or add these environment variables to your app after deployment via the Heroku dashboard):

- `S3_ACCESS_KEY_ID` and `S3_ACCESS_SECRET_KEY`: **Required if using S3 uploads**. These fields are the AWS key/secret pair needed to authenticate with Amazon S3. You must have granted this keypair sufficient permissions on the S3 bucket in question in order for S3 uploads to work.

- `S3_BUCKET_NAME`: **Required if using S3 uploads**. This is the name you gave to your S3 bucket.

- `S3_BUCKET_REGION`: **Required if using S3 uploads**. Specify the region the bucket has been created in, using slug format (e.g. `us-east-1`, `eu-west-1`). A full list of S3 regions is [available here](http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region).

- `S3_ASSET_HOST_URL`: Optional, even if using S3 uploads. Use this variable to specify the S3 bucket URL in virtual host style, path style or using a custom domain. You should also include a trailing slash (example `https://my.custom.domain/`). See [this page](http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html) for details.

Once your app is up and running with these variables in place, you should be able to upload images via the Ghost interface and they’ll be stored in Amazon S3. :sparkles:

##### Provisioning an S3 bucket using an add-on

If you’d prefer not to configure S3 manually, you can provision the [Bucketeer add-on](https://devcenter.heroku.com/articles/bucketeer)
to get an S3 bucket (Bucketeer starts at \$5/mo).

To configure S3 via Bucketeer, leave all the S3 deployment fields blank and deploy your
Ghost blog. Once your blog is deployed, run the following commands from your terminal:

```bash
# Provision an Amazon S3 bucket
heroku addons:create bucketeer --app YOURAPPNAME

# Additionally, the bucket's region must be set to formulate correct URLs
# (Find the "Region" in your Bucketeer Add-on's web dashboard.)
heroku config:set S3_BUCKET_REGION=us-east-1 --app YOURAPPNAME
```

### How this works

This repository is a [Node.js](https://nodejs.org) web application that specifies Ghost as a dependency, and makes a deploy button available.

- Ghost and Casper theme versions are declared in the Node app's [`package.json`](package.json)
- Versions are locked and managed using [npm](https://www.npmjs.com/)
- Scales across processor cores in larger dynos via [Node cluster API](https://nodejs.org/dist/latest-v10.x/docs/api/cluster.html)

## Updating source code

Optionally after deployment, to push Ghost upgrades or work with source code, clone this repo (or a fork) and connect it with the Heroku app:

```bash
git clone https://github.com/snathjr/ghost-on-heroku
cd ghost-on-heroku

heroku git:remote -a YOURAPPNAME
heroku info
```

Then you can push commits to the Heroku app, triggering new deployments:

```bash
git add .
git commit -m "Important changes"
git push heroku master
```

Watch the app's server-side behavior to see errors and request traffic:

```bash
heroku logs -t
```

See more about [deploying to Heroku with git](https://devcenter.heroku.com/articles/git).

### Upgrading Ghost

This repository locks Ghost to the "last tested good version" using the standard `package-lock.json` file. If you want to upgrade Ghost on your own,
you will need to clone or fork this repo as described above. You will then be able to run:

```bash
npm upgrade ghost
git add package.json package-lock.json
git commit -m 'Update dependencies'
git push heroku master
```

If you're worried about packages beyond the root `ghost` server being outdated, you can check using `npm outdated`.

## Problems?

If you have problems using your instance of Ghost, you should check the [official documentation](http://support.ghost.org/) or
open an issue on [the official issue tracker](https://github.com/TryGhost/Ghost/issues). If you discover an issue with the
deployment process provided by _this repository_, then [open an issue here](https://github.com/snathjr/ghost-on-heroku).

## License

Released under the [MIT license](./LICENSE), just like the Ghost project itself.
