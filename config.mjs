import { StreamProtocol } from "./Libraries/ecma-station/ecma-station.mjs";

/**
 * These variables define your Wireless set. Modify as required.
 */

const Dials = {
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

const Switches = {}

const NeedleServo = {
    ioPin: 7
}

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
        frequencyMin: 80,
        frequencyMax: 85,
        type: StreamProtocol.InternetStation,
        url: "https://dj.bronyradio.com/pvfmfree.ogg"
    },
    monstro: {
        type: StreamProtocol.InternetStation,
        url: "https:\/\/radio.dripfeed.net\/listen\/monstromental\/radio.mp3"
    },
    esr: {
        type: StreamProtocol.InternetStation,
        url: "https://streamer.radio.co/s2c3cc784b/listen"
    },
    test: {
        type: StreamProtocol.InternetStation,
        url: "http://firewall.pulsradio.com"
    }
};


export { Dials, Switches, NeedleServo, Stations }