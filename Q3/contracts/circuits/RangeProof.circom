pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template RangeProof(n) {
    assert(n <= 252);
    signal input in; // this is the number to be proved inside the range
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    component low = LessEqThan(n);
    component high = GreaterEqThan(n);

    // [assignment] insert your code here

    low.in[0] <== range[0]; 
    low.in[1] <== in; //low.out will be 1 if: range[0] <= in
    
    high.in[0] <== range[1];
    high.in[1] <== in; //high.out will be 1 if: in range[1] >= in

    out <== low.out*high.out; //out will be 1 if: "in" is in the given range else it will be 0 
}