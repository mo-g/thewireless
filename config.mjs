/**
 * These variables define your Wireless set. Modify as required.
 */

const dials = {
    tone: {
        min: 0.01,
        max: 1,
        channel: 0
    },
    volume: {
        min: 0.01,
        trigger: 0.1,
        max: 1,
        channel: 2
    },
    tuner: {
        min: 0.01,
        max: 1,
        channel: 1,
        integralDial: false
    }
};

const switches = {}

const stations = {
    default: {
        type: "whiteNoise"
    },
    camfm: {
        frequencyMin: 90,
        frequencyMax: 95,
        type: StreamProtocol.ICY,
        url: "https://stream.camfm.co.uk/camfm"
    },
    pvfm3: {
        frequencyMin: 80,
        frequencyMax: 85,
        type: StreamProtocol.ICY,
        url: "https://dj.bronyradio.com/pvfmfree.ogg"
    }
};

/**
 * Al outputs will be played simultaneously.
 * Currently, there's no latency compensation implemented.
 */
const audioOutputs = {
    speaker: {
        alsaDevice: "hw0,0",
        latency: 0,
        channels: 1,
        bitDepth: 16,
        bitRate: 16000
    }
};

const dialServo = {
    ioPin: 7
}

export { dials, switches, stations, audioOutputs, dialServo }