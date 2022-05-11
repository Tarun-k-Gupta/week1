const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16,plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier"); //getting the contractFactory HelloWorldVerifier
        verifier = await Verifier.deploy(); //deploying the contract HelloWorldVerifier
        await verifier.deployed(); //waiting for smart contract to be deployed
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey"); //generating the proof and public signals using groth16.fullProve. It uses .wasm and .zkey file for the same.
        
        console.log('1x2 =',publicSignals[0]); //it prints the public signal which in our case is multiplication of a and b

        const editedPublicSignals = unstringifyBigInts(publicSignals); //calling unstringifyBigInts and passing publicSignals 
        const editedProof = unstringifyBigInts(proof); //doing similar for proof
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); //calling exportSolidityCallData by passing editedProof and editedPublicSignals
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); //replacing some special characters and splitting the values wrt to "," and then converting each of the value to BigInt string
        const a = [argv[0], argv[1]]; //initializing the value of a
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; //initializing the value of b
        const c = [argv[6], argv[7]]; //initializing the value of c
        const Input = argv.slice(8); //initializing the value of d

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; //verifying the proof that whether it is correct or not
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false; //we expect the output to be false since values of a,b,c and d are incorrect
    });
});


//explanation for below code is similar to HelloWorld describe block above

describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;
    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier"); 
        verifier = await Verifier.deploy(); 
        await verifier.deployed(); 
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        
        console.log('1x2x3 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]]; 
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        console.log(Input);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; 
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("_plonkMultiplier3Verifier"); 
        verifier = await Verifier.deploy(); 
        await verifier.deployed(); 
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/_plonkMultiplier3/circuit_final.zkey");
        
        console.log('1x2x3 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        const argv = calldata.replace(/["[\]\s]/g, "").split(',');
        const a = argv[0]; 
        const b = [argv[1]]; 

        expect(await verifier.verifyProof(a, b)).to.be.true; 
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = 0;
        let b = [0];
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});