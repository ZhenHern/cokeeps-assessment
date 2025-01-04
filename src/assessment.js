const sodium = require('libsodium-wrappers');
const ethers = require('ethers');

async function main() {
    await sodium.ready;

    const request = {
        "name": "Chua Zhen Hern",
        "email": "zhenhern@outlook.com",
        "role": "Front-end Engineer",
        "asking-salary": "RM 5000",
        "can-start": "2 months from now (notice period)",
        "myself": "learning libsodium now lol"
    }

    const publicKeyHex = "3730253cd42a1d4c0ff360bfdd834d24dd664519693a641efc8757776ea4f02b";
    const publicKey = sodium.from_hex(publicKeyHex);

    // My own key pair generated using the library
    const myKeyPair = sodium.crypto_box_keypair();

    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

    // Encrypting starts using stringifed json
    const ciphertext = sodium.crypto_box_easy(JSON.stringify(request), nonce, publicKey, myKeyPair.privateKey);


    // Configure transaction details
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/7317264d6f204bb9aafa2ed4a5abc197");
    // Private key is omitted for confidentiality
    const privateKey = "";
    const wallet = new ethers.Wallet(privateKey, provider); 
    const signer = wallet.connect(provider);
    const memo = sodium.to_hex(myKeyPair.publicKey);

    const transaction = {
        to: "0x29a9225d38de0837d8368BB7AB42D5Cc73900C28",
        value: ethers.parseEther('0.000'),
        data: "0x" + memo,
    };

    // For debugging purpose
    const balance = await provider.getBalance("0xE53113e2c4c880b0B32B1b115cEFB232C700076C");
    console.log("Balance: ", ethers.formatEther(balance));

    try {
        const response = await signer.sendTransaction(transaction);
        console.log("\nSuccessfully sent transaction");
        console.log("\nTransaction hash:", response.hash);
    } catch (error) {
        console.error("\nError sending transaction:", error);
    }

    console.log("\nCiphertext: ", sodium.to_hex(ciphertext));
    console.log("\nNonce: ", sodium.to_hex(nonce));
    console.log("\nMy own public key:", sodium.to_hex(myKeyPair.publicKey));
}

main();
