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
//import gpio from 'rpi-gpio';


class Dial {
    constructor (pin) {
        this.ready = false;
        this._dial = mcpspi.openMcp3004(pin, err => this.handler.bind(this) );
    }

    startHandler (err) {
        if (err) {
            console.log(err);
        } else {
            this.ready = true;
        }
    }

    readHandler (err, reading) {
        if (err) {
            console.log(err);
        } else {
            this.value = reading;
        }
    }

    monitor () {
        if (not(this.ready)) {
            return false;
        }
        setInterval(_ => {
            this._dial.read((err, reading) => this.readHandler.bind(this));
          }, 50);
    }

    set value (value) {
        this._value = value;
    }

    get value () {
        return this._value;
    }
}

class Band extends Dial {
    constructor (pin) {
        super(pin)
    }
}

class Tuner extends Dial {
    constructor (pin) {
        super(pin)
    }
}

class FeedbackTuner extends Tuner {
    constructor (pin) {
        super(pin)
    }
}


class Volume extends Dial {
    constructor (pin) {
        super(pin)
    }
}


export { Reader, Band, Tuner, Volume };