'use strict';

// Required Modules
const Iroh = require('iroh');
const fs = require('fs');

// Load Example Code to Analyze
let code = `
    let x = 10;
    function calculateSquare(y) {
        return y * y;
    }
    console.log(calculateSquare(x));
`;

// Create an Iroh Stage and Add Listeners
let stage = new Iroh.Stage(code);

// Listen for Variable Assignments
let varListener = stage.addListener(Iroh.VAR);
varListener.on("after", (e) => {
    console.log(`Variable ${e.name} assigned value ${e.value}`);
});

// Listen for Function Calls
let callListener = stage.addListener(Iroh.CALL);
callListener.on("enter", (e) => {
    console.log(`Function ${e.name} called with arguments: ${e.arguments}`);
});

// Execute the Patched Code
try {
    eval(stage.script);  // Run the code after Iroh processes it
} catch (error) {
    console.error("Error executing patched code:", error);
}