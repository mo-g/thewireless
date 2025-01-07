/**
 * ecma-tunerface, a class to represent an internet radio physical user interface in ECMAScript.
 * Copyright (C) 2024 mo-g
 * 
 * ecma-station is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 * 
 * ecma-station is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with ecma-station  If not, see <https://www.gnu.org/licenses/>.
 */


import mcpspi from 'mcp-spi-adc';


const DialType = {
    Volume: "Controls the volume (loudness) of the speaker output.",
    Band: "Controls the output mode (function) of the speaker.",
    Tuner: "Selects a channel in the radio station list."
}

const BandAction = {
    RadioPlay: "Begin/continue playing radio.",
    RadioPause: "Pause/stop playing radio.",
    AirPlay: "Allow AirPlay override (NOT IMPLEMENTED)",
    GoogleCast: "Allow Chromecast override (NOT IMPLEMENTED)",
    Matter: "Allow Matter override (NOT IMPLEMENTED)"
};


class Dial {
    constructor (adcPin) {
        this.ready = false;
        this.interval = null;
        this._dial = mcpspi.openMcp3004(adcPin, err => this.handler.bind(this) );
    }

    static from (dialSpecs) {
        type = dialSpecs.type;
        channel = dialSpecs.channel;
        switch (dialSpecs.type)  {
            case DialType.Volume:
                return new VolumeDial({channel});
                break;
            case DialType.Tuner:
                if (dialSpecs.integralDial) {
                    return new TunerDial({channel});
                }
                return new ActiveTunerDial({channel});
                break;
            case DialType.Band:
                return new BandDial({channel});
                break;
            default:
                throw "Unsupported dial type:", type;
        };
    }

    startHandler (err) {
        if (err) {
            console.log(err);
        } else {
            this.ready = true;
        };
    }

    readHandler (err, reading) {
        if (err) {
            console.log(err);
        } else {
            this._value = reading;
        };
    }

    monitor () {
        if (not(this.ready)) {
            return false;
        };
        this.interval = setInterval(_ => {
            this._dial.read((err, reading) => this.readHandler.bind(this));
          }, 50);
          return true;
    }

    unmonitor () {
        return clearInterval(this.interval);
    }

    get value () {
        return this._value;
    }
}

class BandDial extends Dial {
    constructor (adcPin) {
        super(adcPin);
    }
}

class TunerDial extends Dial {
    constructor (adcPin) {
        super(adcPin);
    }
}

class ActiveTunerDial extends Dial {
    constructor (adcPin, servoPin) {
        super(adcPin);
        this.servoPin = servoPin;
    }
}


class VolumeDial extends Dial {
    constructor (pin) {
        super(pin)
    }
}

class Band {
    constructor () {

    }
    static from (bandSpecs) {

    }

}


export { DialType, BandAction, BandDial, TunerDial, VolumeDial };