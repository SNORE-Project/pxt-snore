/**
 * SNORE helper functions
 */
//% weight=10 color=#0E1525 icon="\uf236" groups=["Wristwatch", "Stationary"]
namespace snore {
    radio.setGroup(0);

    interface DataStore {
        accel: number,
        pulse?: number,
        vol: number,
        bpData?: Array<number>
    }

    const statStore: DataStore = {
        accel: 0,
        pulse: 0,
        vol: 0
    };

    const watchStore: DataStore = {
        accel: 0,
        vol: 0,
        bpData: []
    };

    let day: number;

    function formatDay(givenDay: number): string {
        let output = givenDay.toString();
        if (output.length == 1) {
            return "0" + output;
        } else {
            return output;
        }
    }

    function getCurrentDay(): number {
        let latest = 1;
        let go = true; 
        while (go) {
            if (IM01.fileExists(`${formatDay(day)}.csv`)) {
                latest++;
            } else {
                go = false;
            }
        }

        return latest;
    }

    // Stationary

    /**
     * Initialise the data store and the csv file
     */
    //% block="initialise" group="Stationary"
    export function initialise(): void {
        day = getCurrentDay();

        IM01.overwriteFile(`${formatDay(day)}.csv`, "accel,pulse,vol\n");
        IM01.overwriteFile("id.txt", control.deviceSerialNumber().toString());
    }

    /**
    * Save received data to temporary storage
    */
    //% block="receive data" group="Stationary"
    export function receiveData(name: string, value: number): void {
        if (name == "accel") {
            statStore.accel = value;
        } else if (name == "pulse") {
            statStore.pulse = value;
        } else if (name == "vol") {
            statStore.vol = value;
        }
    }

    /**
     * Save the data in temporary storage to the sd card
     */
    //% block="store data" group="Stationary"
    export function storeData(): void {
        IM01.appendFileLine(`${formatDay(day)}.csv`, `${statStore.accel},${statStore.pulse},${statStore.vol}`)
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
        // TODO
    }

    /**
     * Send the data from the wristwatch to the stationary micro:bit
     */
    //% block="send data" group="Wristwatch"
    export function sendData(): void {
        radio.sendValue("accel", watchStore.accel);
        // TODO calculate and send pulse
        radio.sendValue("vol", watchStore.vol);
    }
}
