const Scalar = require("ffjavascript").Scalar;
const poseidon = require("circomlib").poseidon;

const utils = require("./utils");

class RollupTx {

    constructor(tx){
        this.loadAmount = Scalar.e(tx.loadAmount || 0);
        this.fromIdx = Scalar.e(tx.fromIdx || 0);
        this.toIdx = Scalar.e(tx.toIdx || 0);
        this.loadAmount = Scalar.e(tx.loadAmount || 0);
        this.amount = Scalar.e(tx.amount || 0);
        this.coin = Scalar.e(tx.coin || 0);
        this.nonce = Scalar.e(tx.nonce || 0);
        this.userFee = Scalar.e(tx.userFee || 0);
        this.rqOffset = Scalar.e(tx.rqOffset || 0);
        this.onChain = Scalar.e(tx.onChain ? 1 : 0);
        this.newAccount = Scalar.e(tx.newAccount ? 1 : 0);
        this.rqTxData = Scalar.e(tx.rqTxData || 0);

        // parse toAccount
        if (typeof tx.toAx === "string") this.toAx = Scalar.fromString(tx.toAx, 16);
        else this.toAx = Scalar.e(tx.toAx || 0);

        if (typeof tx.toAy === "string") this.toAy = Scalar.fromString(tx.toAy, 16);
        else this.toAy = Scalar.e(tx.toAy || 0);

        if (typeof tx.toEthAddr === "string") this.toEthAddr = Scalar.fromString(tx.toEthAddr, 16);
        else this.toEthAddr = Scalar.e(tx.toEthAddr || 0);

        // on-chain
        this.loadAmount = Scalar.e(tx.loadAmount || 0);
        // parse fromAccount
        if (typeof tx.fromAx === "string") this.fromAx = Scalar.fromString(tx.fromAx, 16);
        else this.fromAx = Scalar.e(tx.fromAx || 0);

        if (typeof tx.fromAy === "string") this.fromAy = Scalar.fromString(tx.fromAy, 16);
        else this.fromAy = Scalar.e(tx.fromAy || 0);

        if (typeof tx.fromEthAddr === "string") this.fromEthAddr = Scalar.fromString(tx.fromEthAddr, 16);
        else this.fromEthAddr = Scalar.e(tx.fromEthAddr || 0);

        this._roundValues();
    }

    _roundValues(){
        const amountF = utils.fix2float(this.amount);
        this.amount = utils.float2fix(amountF);
        const userFeeF = utils.fix2float(this.userFee);
        this.userFee = utils.float2fix(userFeeF);

        this.amountF = Scalar.e(amountF);
        this.userFeeF = Scalar.e(userFeeF);
    }

    getTxData() {
        const IDEN3_ROLLUP_TX = Scalar.e("4839017969649077913");
        let res = Scalar.e(0);
    
        res = Scalar.add(res, IDEN3_ROLLUP_TX);
        res = Scalar.add(res, Scalar.shl(this.amountF, 64));
        res = Scalar.add(res, Scalar.shl(this.coin, 80));
        res = Scalar.add(res, Scalar.shl(this.nonce, 112));
        res = Scalar.add(res, Scalar.shl(this.userFeeF, 160));
        res = Scalar.add(res, Scalar.shl(this.rqOffset, 176));
        res = Scalar.add(res, Scalar.shl(this.onChain, 179));
        res = Scalar.add(res, Scalar.shl(this.newAccount, 180));
    
        return res;
    }

    getHashSignature(){
        const txData = this.getTxData();
        const hash = poseidon.createHash(6, 8, 57);

        const h = hash([
            txData,
            this.rqTxData,
            this.toAx,
            this.toAy,
            this.toEthAddr,
        ]);
        return h;
    }

    addSignature(signature, fromAx, fromAy){
        this.r8x = signature.R8[0];
        this.r8y = signature.R8[1];
        this.s = signature.S;

        if (typeof fromAx === "string")
            this.fromAx = Scalar.fromString(fromAx, 16);
        else
            this.fromAx = Scalar.e(fromAx || 0);

        if (typeof fromAy === "string")
            this.fromAy = Scalar.fromString(fromAy, 16);
        else
            this.fromAy = Scalar.e(fromAy || 0);
    }

    getOnChainHash(oldOnChainHash){
        const txData = this.getTxData();
        const hash = poseidon.createHash(6, 8, 57);

        const dataOnChain = hash([
            this.fromAx,
            this.fromAy,
            this.toEthAddr,
            this.toAx,
            this.toAy,
        ]);

        const h = hash([
            Scalar.e(oldOnChainHash || 0),
            txData,
            this.loadAmount,
            dataOnChain,
            this.fromEthAddr,
        ]);
        return h;
    }
}

module.exports = RollupTx;