# alexa-anounce
Wrapper of AWS JavaScript SDK's alexaforbusiness.SendAnnouncement()

# Description

This package is a wrapper for the AWS SDK's alexaforbusiness.SendAnnouncement() method.  It offers a simpler interface for quick and easy use in projects.  If called from a Lambda, you can send an announcement in as little as 3 lines of code.

# Usage
The best-case scenario is running this in a Lambda where env vars supply auth values.  In that case, you can use it like this:

```javascript
const aa = require('alexa-announce');
const Announcer = new aa.Announcer();

(async () => await Announcer.announce('Hello'))();
```

If you're running locally (or somewhere else) you'll need to specify credentials and optionally region like this:

```javascript
const aa = require('alexa-announce');
const options = {
    region: 'us-east-1', // optional, default to us-east-1
    clientRequestToken: 'some idempotency token', // optinal, auto-generated if omitted
    timeToLiveInSeconds: 300, // optional, default to 300
    accessKeyId: 'your access key', // required if not provided by process.env
    secretAccessKey: 'your secret key' // required if not provided by process.env
}

const Announcer = new aa.Announcer(options); // pass options to constructor

(async () => {
    // You can capture the return value which has the format shown in the Output section
    let result = await Announcer.announce('This is an announcement from alexa announce');
    console.log(JSON.stringify(result));
})();
```

You can specify targets for the announcement by using classes exposed by the alexa-announce package.  Here's an example, and if you need clarification on how to use these please consult the AWS API docs here: https://docs.aws.amazon.com/a4b/latest/APIReference/API_SendAnnouncement.html

```javascript
const aa = require('alexa-announce');
const options = {
    accessKeyId: 'your access key',
    secretAccessKey: 'your secret key'
}
const Announcer = new aa.Announcer(options);

(async () => {

    Announcer.addTargets([

        // Ex. RoomTarget by filter string
        new aa.RoomTarget('Conference'),

        // Ex. ProfileTarget by filter string
        //new aa.ProfileTarget('Some Profile'),

        // Ex. RoomArnTarget by room Arn
        //new aa.RoomArnTarget('your arn'),

        // Ex. ProfileArnTarget by profile Arn
        //new aa.ProfileArnTarget('your arn')
    ]);

    let result = await Announcer.announce('This is an announcement from alexa announce');

    console.log(JSON.stringify(result));
})();
```
If you're running on a platform where the standard AWS env vars are not defined, you'll need to specify your credentials (and region, optionally) yourself. 

# Methods

### announce
`announce('the string you want to be announced')`

NOTE: Announcement must be 250 characters or fewer.

The output of the `announce()` method is just the output of the `SendAnnouncement()` method, which is an object containing the Arn of the announcement.

```json
{
    "AnnouncementArn":"arn:aws:a4b:us-east-1:1234567890:announcement/123abc/lotsofstuff"
}
```
### addTargets
`addTargets(arrayOfTargets)`

### clearTargets
`clearTargets()`

No parameters or return value.  Clears any targets specified previously, which has the effect of defaulting to all targets.  Calling this is the same as calling `targetAll()`

### targetAll
`targetAll()`

No parameters or return value.  Clears any targets specified previously and targets all available devices.

# Resources
AWS Environment Variables: https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
API Reference for `sendAnnouncement`: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/AlexaForBusiness.html#sendAnnouncement-property
API Guide for SendAnnouncement: https://docs.aws.amazon.com/a4b/latest/APIReference/API_SendAnnouncement.html