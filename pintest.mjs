/**
 * thewireless, an internet radio client for upcycling with Pi.
 * Copyright (C) 2023 mo-g
 * 
 * thewireless is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 * 
 * thewireless is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with thewireless  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Note - this program will initially contain methods and assumptions that will
 * be transferred to more specific models, config and interfaces as development
 * progresses. This will start ugly and clean up as we work out the final
 * architecture.
 */


import mcpspi from 'mcp-spi-adc';
//import gpio from 'rpi-gpio';

const tuner = mcpspi.openMcp3004(1, err => {
    if (err) throw err;
  
    setInterval(_ => {
      tuner.read((err, reading) => {
        if (err) throw err;
  
        console.log(reading.value);
      });
    }, 1000);
  });