/**
 * SNORE helper functions
 */
//% weight=10 color=#0E1525 icon="\uf236" groups=["Wristwatch", "Stationary"]
namespace snore {
    radio.setGroup(0);
    
    export const intervalSize = 200;
    export const bpMeasuresPerInterval = 20;
    export let version = "";

    const statStore  = {
        accel: 0,
        //pulse: 0,
        vol: 0,
        bpData: ""
    };

    const watchStore = {
        accel: 0,
        vol: 0,
        bpData: <Array<number>>[]
    };


    // Stationary

    /**
     * Initialise the data store and the csv file
     */
    //% block="initialise" group="Stationary"
    export function initialise(): void {
        IM01.overwriteFile("info.txt", `${control.deviceSerialNumber().toString()}\n${control.deviceName()}\n${version}\n`);
        IM01.appendFile("data.csv", "accel,vol,pulseData\n");

        IM01.turn_off_leds();
    }

    /**
     * Save received data to temporary storage
     */
    //% block="receive data" group="Stationary"
    export function receiveData(name: string, value: number): void {
        if (name == "accel") {
            statStore.accel = value;
        /*
        } else if (name == "pulse") {
            statStore.pulse = value;
        */
        } else if (name == "vol") {
            statStore.vol = value;
        } else if (name == "version") {
            IM01.appendFile("info.txt", value.toString());
        }
    }

    /**
     * Save recieved pulse data to temporary storage
     */
    //% block="recieve pulse" group="Stationary"
    export function recievePulse(data: string): void {
        statStore.bpData += data;
    }

    /**
     * Save the data in temporary storage to the sd card
     */
    //% block="store data" group="Stationary"
    export function storeData(): void {
        IM01.appendFileLine("data.csv", `${statStore.accel},${statStore.vol},${statStore.bpData}`);
        statStore.bpData = "";
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
        /*
        let total = 0;
        for (let i = 0; i < watchStore.bpData.length; i++) {
            total += watchStore.bpData[i];
        }
        
        let pulse = (total / watchStore.bpData.length) * (60000 / intervalSize);
        radio.sendValue("pulse", pulse);
        watchStore.bpData = [];
        */
        radio.sendValue("vol", watchStore.vol);

        let done = false;
        let bpData = "^" + watchStore.bpData.join(";") + "$";
        watchStore.bpData = [];
        let i = 0;
        while (i < bpData.length) {
            let lastChar = i + 19;
            if (lastChar > bpData.length) {
                lastChar = bpData.length;
            }
            radio.sendString(bpData.slice(i, lastChar));
            i = lastChar;
        }
    }
}
