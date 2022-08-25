/**
 * Custom blocks
 */
//% weight=10 color=#0E1525 icon="\uf236" groups=["Wristwatch", "Stationary"]
namespace snore {
    radio.setGroup(0);

    interface DataStore {
        accel: number,
        pulse: number,
        sound?: number,
        bpData?: Array<number>
    }

    const statStore: DataStore = {
        accel: 0,
        pulse: 0,
        sound: 0
    };

    const watchStore: DataStore = {
        accel: 0,
        pulse: 0,
        bpData: []
    };

    let accelAvg: number;
    let pulse: number;
    let sound: number;

    function getCurrentDay(): string {
        basic.showString(timeanddate.dateTime());
        return timeanddate.dateTime().slice(8, 10);
    }

    // Stationary

    /**
     * Initialise the data store and the csv file
     */
    //% block="initialise" group="Stationary"
    export function initialise(): void {
        timeanddate.setDate(1, 1, 0);
        timeanddate.set24HourTime(5, 0, 0);

        IM01.overwriteFile(`${getCurrentDay()}.csv`, "accel,pulse,sound\n");
        IM01.overwriteFile("id.txt", control.deviceSerialNumber().toString());
    }

    /**
    * Save recieved data to temporary storage
    */
    //% block="recieve data" group="Stationary"
    export function recieveData(name: string, value: number): void {
        if (name == "accel") {
            statStore.accel = value;
        } else if (name == "pulse") {
            statStore.pulse = value;
        }
    }

    /**
     * Save the data in temporary storage to the sd card
     */
    //% block="store data" group="Stationary"
    export function storeData(): void {
        IM01.appendFileLine(`${control.deviceSerialNumber()}-${getCurrentDay()}.csv`, `${statStore.accel},${statStore.pulse},${statStore.sound}`)
    }

    /**
     * Store the current volume to temporary storage
     */
    //% block="store volume" group="Stationary"
    export function storeSound(): void {
        statStore.sound = input.soundLevel();
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
    }
}