import { StreamProtocol } from "./Libraries/ecma-station/ecma-station.mjs";
import { DialType, BandAction } from "./Libraries/ecma-tunerface/ecma-tunerface.mjs"


const NeedleServo = {
    ioPin: 7
}

/**
 * These variables define your Wireless set. Modify as required.
 */

const Dials = {
    band: {
        type: DialType.Band,
        deadbandLimit: 0.01,
        maximum: 1,
        channel: 0
    },
    tuner: {
        type: DialType.Tuner,
        min: 0.01,
        max: 1,
        channel: 1,
        integralDial: true
    },
    volume: {
        type: DialType.Volume,
        min: 0.01,
        trigger: 0.1,
        max: 1,
        channel: 2
    }
};


/*
    Define the radio stations. frequency ranges must not overlap. 
    static is a "magic value" - the item called "static" will always be the fallback.
*/
const Stations = {
    static: {
        type: StreamProtocol.Static,
        url: "file:///opt/thewireless/static.mp3"
    },
    camfm: {
        frequencyMin: 90,
        frequencyMax: 95,
        type: StreamProtocol.InternetStation,
        url: "https://stream.camfm.co.uk/camfm"
    },
    pvfm3: {
        frequencyMin: 5,
        frequencyMax: 10,
        type: StreamProtocol.InternetStation,
        url: "https://dj.bronyradio.com/pvfmfree.ogg"
    },
    monstro: {
        frequencyMin: 25,
        frequencyMax: 30,
        type: StreamProtocol.InternetStation,
        url: "https:\/\/radio.dripfeed.net\/listen\/monstromental\/radio.mp3"
    },
    esr: {
        frequencyMin: 45,
        frequencyMax: 50,
        type: StreamProtocol.InternetStation,
        url: "https://streamer.radio.co/s2c3cc784b/listen"
    },
    test: {
        frequencyMin: 80,
        frequencyMax: 85,
        type: StreamProtocol.InternetStation,
        url: "http://firewall.pulsradio.com"
    }
};

// 
const Bands = {
    on: {
        type: BandAction.RadioPlay,
        "frequencyMin": 0,
        "frequencyMax": 45,
    },
    off: {
        type: BandAction.RadioPause,
        "frequencyMin": 55,
        "frequencyMax": 100,
    }
}


export { Dials, NeedleServo, Stations, Bands }