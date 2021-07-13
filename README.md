# [Ghost 4.X](https://github.com/TryGhost/Ghost) on [Heroku](http://heroku.com)

Ghost is a free, open, simple blogging platform. Visit the project's website at <http://ghost.org>, or read the docs on <http://support.ghost.org>.

[![GitHub issues](https://img.shields.io/github/issues/intra-sh/ghost-on-heroku)](https://github.com/intra-sh/ghost-on-heroku/issues)
[![GitHub forks](https://img.shields.io/github/forks/intra-sh/ghost-on-heroku)](https://github.com/intra-sh/ghost-on-heroku/network)
[![GitHub stars](https://img.shields.io/github/stars/intra-sh/ghost-on-heroku)](https://github.com/intra-sh/ghost-on-heroku/stargazers)
[![Deploy to Heroku](https://img.shields.io/badge/deploy%20to-heroku-6762a6)](https://heroku.com/deploy)

## Disclaimer
This is a fork of:
- https://github.com/SNathJr/ghost-on-heroku which in turn is a fork of:
- https://github.com/cobyism/ghost-on-heroku

I have forked and improved this repository as the original developer seemed to have abandoned his repo recently. In this repository I have upgraded ghost to ghost 4.X. If you are still interested with the ghost 3.x (SNathJr) or 1.0 (cobyism) version please visit the respective repository.

## Ghost version 4.X

The latest release of Ghost is now supported! Changes include:

- Requires MySQL database, available through either of two add-ons:
  - [JawsDB](https://elements.heroku.com/addons/jawsdb) (deploy default)
  - [ClearDB](https://elements.heroku.com/addons/cleardb)
- `PUBLIC_URL` config var renamed to `APP_PUBLIC_URL` to give it alphabetical precedence
- The app is configured to use `Cloudinary File Storage` by default.
- Dark Mode on `casper` theme! Please make sure to activate your system's dark-mode first.

### Deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

If the above button does not work for you, disable anything that might be blocking Heroku from inferring the referrer (e.g. Brave shield), or try this: https://heroku.com/deploy?template=https://github.com/snathjr/ghost-on-heroku (if you're using a fork, make sure to point the template link to your repo).

**NOTE**: we do _not_ support deploying by downloading the source file or by copying over a cloned folder. Downloading/copying folders tends to break symlinks, so we recommend that you deploy by clicking the button in this repository or your fork on GitHub.

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

#### Configuring WebDAV file uploads

As an alternative to S3 and Cloudinary, you can also use your own WebDAV server, via the [ghost-webdav-adapter](https://github.com/bartt/ghost-webdav-storage-adapter) plugin. To use these, simply specify the following details as environment variables on the Heroku deployment page (or add these environment variables to your app after deployment via the Heroku dashboard):

- `WEBDAV_SERVER_URL`: **Required if using WebDAV uploads**. The URL to access your WebDAV server. Note that this requires the `https` format (not `dav://` or `davs://`). Example: `https://mysite.com:2078`.

- `WEBDAV_USERNAME` and `WEBDAV_PASSWORD`: Optional even if using WebDAV uploads. These are the username and password used to log in to your WebDAV account. Unless you're using an open and unsecured server, you'll probably need to set these options too.

- `WEBDAV_PATH_PREFIX`: Optional even if using WebDAV uploads. Subfolder on the WebDAV server where you want to store the files. Defaults to the main directory or `/`. Example: `/ghost-uploads`.

- `WEBDAV_STORAGE_PATH_PREFIX`: Optional even if using WebDAV uploads. This is the location where the public will be able to access the uploaded file. Defaults to `content/`, which makes Ghost server the files for you, but can also be an external domain such as `https://media.mysite.com/ghost-files`.

The difference between `WEBDAV_PATH_PREFIX` and `WEBDAV_STORAGE_PATH_PREFIX` is this: you *upload* the files to `WEBDAV_PATH_PREFIX` via WebDAV, but you *download* them from `WEBDAV_STORAGE_PATH_PREFIX` using ordinary HTTP.

For more detailed information, you can refer to [the ghost-webdav-adapter repo](https://github.com/bartt/ghost-webdav-storage-adapter)

##### Known Issue

There is a bug (that only occurs sometimes): when uploading a file to a subdirectory, it creates one level of the directory and then fails, so you have to retry to get to the next level. For example: if it wants to save the file 2020/06/12/example.jpg but only the 2020 folder exists, then it will take three tries (refresh the page and upload again) to get it working:

- create 2020/06 and fail
- create 2020/06/12 and fail
- upload the file to 2020/06/12/example.jpg

This seems to be a bug in the storage adapter plugin itself (yet to be reported).

**Note:** Remember to **refresh** the page on each retry. Retrying without refreshing the page does not seem to work. If you don't succeed after 3-4 tries, there might be something else wrong with your configuration.

#### Setting up SMTP service

When you spin up your heroku dyno for the first time, mailgun is by default setup with a sandbox account. It means, sending emails to only authorized reciepients is supported. If you want to send emails / invite your collaborators you need to set their email in authorized recipient section on mailgun dashboard. See https://help.mailgun.com/hc/en-us/articles/217531258-Authorized-Recipients for more.

A more permanent solution would be to use a custom domain and verify your domain via mailgun customer support. Cheers!

FYI: You can access mailgun dashboard by visiting heroku dashboard > click on your app > resources tab > click on mailgun addon.

#### Dark Mode is now available

As of version 3.0.0 Dark mode is available on Ghost Casper theme. Please make sure your's system's dark mode is enabled first to activate dark mode.

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
