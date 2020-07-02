const AWS = require('aws-sdk');
const util = require('util');

var paramsBase = {
    Content: { 
        TextList: [
            {
                Locale: 'en-US',
                Value: 'Please specify text when calling alexa announce'
            }
        ]
    },
    RoomFilters: [],
    TimeToLiveInSeconds: 300
}

var params = {};

const TARGET_TYPES = {
    RoomName: 'RoomName',
    ProfileName: 'ProfileName',
    RoomArn: 'RoomArn',
    ProfileArn: 'ProfileArn'
}

/**
 * Base class for an announcement target
 */
class Target {
    constructor(type, filters) {
        this.type = type;
        this.filters = filters;
    }

    type = TARGET_TYPES.RoomName
    filters = []
}

/**
 * Room target subclass
 */
class RoomTarget extends Target {
    constructor(...rooms) {
        super(TARGET_TYPES.RoomName, rooms);
    }
}

/**
 * Profile target subclass
 */
class ProfileTarget extends Target {
    constructor(...profiles) {
        super(TARGET_TYPES.ProfileName, profiles);
    }
}

/**
 * Room Arn subclass
 */
class RoomArnTarget extends Target {
    constructor(...arns) {
        super(TARGET_TYPES.RoomArn, arns);
    }
}

/**
 * Profile Arn subclass
 */
class ProfileArnTarget extends Target {
    constructor(...arns) {
        super(TARGET_TYPES.ProfileArn, arns);
    }
}

/**
 * Main Announcer export class
 */
class Announcer {

    constructor(options) {

        // Check for implicit or explicit credentials
        if(!options && !process.env.AWS_ACCESS_KEY_ID) {
            throw new Error('No aws config specified and no credentials found in process.env');
        }

        // Use credentials specified if they were specified
        if(options.accessKeyId && options.secretAccessKeyId) {
            options.credentials = AWS.Credentials({
                accessKeyId: options.accessKeyId,
                secretAccessKeyId: options.secretAccessKeyId
            });
        }

        if(options.region === undefined) options.region = 'us-east-1';

        // Setup AWS pieces
        AWS.config.update(options);
        this.a4b = new AWS.AlexaForBusiness();
        this.a4b.sendAnnouncement = util.promisify(this.a4b.sendAnnouncement);

        // Prep params for request
        params = paramsBase;
        
        if (options) {
            // Init options
            if ('timeToLiveInSeconds' in options) params.TimeToLiveInSeconds = options.timeToLiveInSeconds;
            if ('clientRequestToken' in options) params.ClientRequestToken = options.clientRequestToken;
        }

        // Function bindings
        this.addTargets = this.addTargets.bind(this);
        this.announce = this.announce.bind(this);
        this.clearTargets = this.clearTargets.bind(this);
        this.targetAll = this.targetAll.bind(this);
    }

    /**
     * Add targets for the announcement
     * @param {Array} targets Array of Target-derived objects
     */
    addTargets(targets) {
        if (!Array.isArray(targets)) throw new Error('Value for parameter "targets" was not of type Array');

        let RoomFilters = [];

        targets.forEach(x => {
            RoomFilters.push({
                Key: x.type,
                Values: x.filters
            });
        });

        params.RoomFilters = RoomFilters;
    }

    /**
     * Clear any targets specified.  Effectively the same as targetAll()
     */
    clearTargets() {
        params.RoomFilters = [];
    }

    /**
     * Target all devices by removing all existing targets.
     */
    targetAll() {
        this.clearTargets();
    }

    /**
     * Announce the text specified.
     * If called before you've specified targets by "addTargets()"
     * the announcement will be made on all available targets
     * @param {string} text Text to announce via Alexa for Business
     */
    async announce(text) {
        // Validate input
        if(!(typeof text === "string")) throw new Error('announce() requires a string as a parameter');
        if(text.length > 250) throw new Error('250 character max for announcement text');

        // Set text to announce
        params.Content.TextList[0].Value = text;

        let result = await this.a4b.sendAnnouncement(params);
        return result;
    }
}

module.exports = {
    Announcer,
    RoomTarget,
    ProfileTarget,
    RoomArnTarget,
    ProfileArnTarget
}