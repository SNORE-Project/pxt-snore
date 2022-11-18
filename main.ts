/**
 * SNORE helper functions
 */
//% weight=10 color=#0E1525 icon="\uf236" groups=["Wristwatch", "Stationary"]
namespace snore {
    radio.setGroup(0);
    
    export const intervalSize = 200;
    export const bpMeasuresPerInterval = 20;

    const statStore  = {
        accel: 0,
        //pulse: 0,
        vol: 0,
        bpData: "blank",
        recieved: false
    };

    const watchStore = {
        accel: 0,
        vol: 0,
        bpData: <Array<number>>[]
    };

    let day = -1;

    function formatDay(givenDay: number): string {
        let output = givenDay.toString();
        if (output.length == 1) {
            //basic.showString("added 0");
            return "0" + output;
        } else {
            //basic.showString("no added 0");
            return output;
        }
    }

    function getCurrentDay(): number {
        let latest = 1;
        let go = true; 
        while (go) {
            if (IM01.fileExists(`${formatDay(latest)}.csv`)) {
                //basic.showString(`file ${formatDay(latest)}.csv exists`);
                latest++;
            } else {
                //basic.showString(`file ${formatDay(latest)}.csv is valid`);
                go = false;
            }
        }

        //basic.showString(`day is ${latest}`)
        return latest;
    }

    // Stationary

    /**
     * Initialise the data store and the csv file
     */
    //% block="initialise" group="Stationary"
    export function initialise(): void {
        day = getCurrentDay();

        IM01.turn_off_leds();

        IM01.overwriteFile(`${formatDay(day)}.csv`, "accel,vol,pulseData\n");
        IM01.overwriteFile("id.txt", control.deviceSerialNumber().toString());

        //basic.showString("finished initialising");
    }

    /**
     * Save received data to temporary storage
     */
    //% block="receive data" group="Stationary"
    export function receiveData(name: string, value: number): void {
        statStore.recieved = true;

        if (name == "accel") {
            statStore.accel = value;
        /*
        } else if (name == "pulse") {
            statStore.pulse = value;
        */
        } else if (name == "vol") {
            statStore.vol = value;
        }
    }

    /**
     * Save recieved pulse data to temporary storage
     */
    //% block="recieve pulse" group="Stationary"
    export function recievePulse(data: string): void {
        statStore.bpData = data;
    }

    /**
     * Save the data in temporary storage to the sd card
     */
    //% block="store data" group="Stationary"
    export function storeData(): void {
        if (statStore.recieved) {
            IM01.appendFileLine(`${formatDay(day)}.csv`, `${statStore.accel},${statStore.vol},${statStore.bpData}`)
        }
        statStore.bpData = "blank";
        statStore.recieved = true;
    }

    // Wristwatch

    /**
     * Record the current acceleration
     */
    //% block="record acceleration" group="Wristwatch"
    export function recordAccel(): void {
        watchStore.accel = Math.sqrt(
            input.acceleration(Dimension.X) ** 2 +
            input.acceleration(Dimension.Y) ** 2 +
            input.acceleration(Dimension.Z) ** 2
        );
    }

    /**
     * Record the current volume
     */
    //% block="record volume" group="Wristwatch"
    export function recordVol(): void {
        watchStore.vol = input.soundLevel();
    }

    /**
     * Record the current blood pressure
     */
    //% block="record blood pressure" group="Wristwatch"
    export function recordBP(): void {
        watchStore.bpData.push(pins.analogReadPin(AnalogPin.P0));
    }

    /**
     * Send the data from the wristwatch to the stationary micro:bit
     */
    //% block="send data" group="Wristwatch"
    export function sendData(): void {
        radio.sendValue("accel", watchStore.accel);
        let total = 0;
        for (let i = 0; i < watchStore.bpData.length; i++) {
            total += watchStore.bpData[i];
        }
        /*
        let pulse = (total / watchStore.bpData.length) * (60000 / intervalSize);
        radio.sendValue("pulse", pulse);
        watchStore.bpData = [];
        */
        radio.sendValue("vol", watchStore.vol);
        let bpData = "";
        for (let i = 0; i < watchStore.bpData.length; i++) {
            bpData += `${watchStore.bpData[i]};`;
        }
        watchStore.bpData = [];
        radio.sendString(bpData);
    }
}
