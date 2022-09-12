// Initialise
snore.initialise();
radio.onReceivedValue(snore.storeData)

// Wristwatch tests
snore.recordAccel();
snore.recordBP();
snore.recordVol();
snore.sendData();

// Stationary tests
snore.storeData();