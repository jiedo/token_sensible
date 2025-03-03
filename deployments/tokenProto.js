const proto = require('./protoheader')
const {bsv} = require('scryptlib')

const token = module.exports

// token specific
//<type specific data> = <token_name (20 bytes)> + <token_symbol (10 bytes)> + <is_genesis(1 byte)> + <decimal_num(1 byte)> + <public key hash(20 bytes)> + <token value(8 bytes)> + <tokenid(36 bytes)> + <proto header>
const TOKEN_ID_LEN = 36
const TOKEN_AMOUNT_LEN = 8
const TOKEN_ADDRESS_LEN = 20
const DECIMAL_NUM_LEN = 1
const GENESIS_FLAG_LEN = 1
const TOKEN_SYMBOL_LEN = 10
const TOKEN_NAME_LEN = 20

const TOKEN_ID_OFFSET = TOKEN_ID_LEN + proto.getHeaderLen()
const TOKEN_AMOUNT_OFFSET = TOKEN_ID_OFFSET + TOKEN_AMOUNT_LEN
const TOKEN_ADDRESS_OFFSET = TOKEN_AMOUNT_OFFSET + TOKEN_ADDRESS_LEN
const DECIMAL_NUM_OFFSET = TOKEN_ADDRESS_OFFSET + DECIMAL_NUM_LEN
const GENESIS_FLAG_OFFSET = DECIMAL_NUM_OFFSET + GENESIS_FLAG_LEN
const TOKEN_SYMBOL_OFFSET = GENESIS_FLAG_OFFSET + TOKEN_SYMBOL_LEN
const TOKEN_NAME_OFFSET = TOKEN_SYMBOL_OFFSET + TOKEN_NAME_LEN 

const TOKEN_HEADER_LEN = TOKEN_NAME_OFFSET

token.GENESIS_TOKEN_ID = Buffer.alloc(TOKEN_ID_LEN, 0)
token.EMPTY_ADDRESS = Buffer.alloc(TOKEN_ADDRESS_LEN, 0)


token.PROTO_TYPE = 1

token.getHeaderLen = function() {
  return TOKEN_HEADER_LEN
}

token.getTokenAmount = function(script) {
  return script.readBigUInt64LE(script.length - TOKEN_AMOUNT_OFFSET)
}

token.getTokenID = function(script) {
  return script.subarray(script.length - TOKEN_ID_OFFSET, script.length - TOKEN_ID_OFFSET + TOKEN_ID_LEN);
}

token.getTokenAddress = function(script) {
  return script.subarray(script.length - TOKEN_ADDRESS_OFFSET, script.length - TOKEN_ADDRESS_OFFSET + TOKEN_ADDRESS_LEN);
}

token.getDecimalNum = function(script) {
  return script.readUIntLE(script.length - DECIMAL_NUM_OFFSET, DECIMAL_NUM_LEN)
}

token.getGenesisFlag = function(script) {
    return script.readUIntLE(script.length - GENESIS_FLAG_OFFSET, GENESIS_FLAG_LEN)
}

token.getTokenSymbol = function(script) {
  return script.subarray(script.length - TOKEN_SYMBOL_OFFSET, script.length - TOKEN_SYMBOL_OFFSET + TOKEN_SYMBOL_LEN)
}

token.getTokenName = function(script) {
  return script.subarray(script.length - TOKEN_NAME_OFFSET, script.length - TOKEN_NAME_OFFSET + TOKEN_NAME_LEN)
}

token.getContractCode = function(script) {
  return script.subarray(0, script.length - TOKEN_HEADER_LEN - 3)
}

token.getContractCodeHash = function(script) {
  return bsv.crypto.Hash.sha256ripemd160(token.getContractCode(script))
}

token.getOracleData = function(script) {
  return script.subarray(script.length - TOKEN_HEADER_LEN, script.length)
}

token.getNewTokenScript = function(scriptBuf, address, tokenAmount) {
  const amountBuf = Buffer.alloc(8, 0)
  amountBuf.writeBigUInt64LE(BigInt(tokenAmount))
  const firstBuf = scriptBuf.subarray(0, scriptBuf.length - TOKEN_ADDRESS_OFFSET)
  const newScript = Buffer.concat([
    firstBuf,
    address,
    amountBuf,
    scriptBuf.subarray(scriptBuf.length - TOKEN_ID_OFFSET, scriptBuf.length)
  ])
  return newScript
}

token.getNewGenesisScript = function(scriptBuf, tokenID) {
  const firstBuf = scriptBuf.subarray(0, scriptBuf.length - TOKEN_ID_OFFSET)
  const newScript = Buffer.concat([
    firstBuf,
    tokenID,
    scriptBuf.subarray(scriptBuf.length - proto.getHeaderLen(), scriptBuf.length)
  ])
  return newScript
}

token.getNewTokenScriptFromGenesis = function(scriptBuf, addressBuf, tokenAmount, tokenID) {
  const amountBuf = Buffer.alloc(8, 0)
  amountBuf.writeBigUInt64LE(BigInt(tokenAmount))
  const genesisFlag = Buffer.alloc(GENESIS_FLAG_LEN, 0)
  const decimalBuf = scriptBuf.subarray(scriptBuf.length - DECIMAL_NUM_OFFSET, scriptBuf.length - DECIMAL_NUM_OFFSET + DECIMAL_NUM_LEN)
  const firstBuf = scriptBuf.subarray(0, scriptBuf.length - GENESIS_FLAG_OFFSET)
  const newScript = Buffer.concat([
    firstBuf,
    genesisFlag,
    decimalBuf,
    addressBuf,
    amountBuf,
    tokenID,
    scriptBuf.subarray(scriptBuf.length - proto.getHeaderLen(), scriptBuf.length)
  ])
  return newScript
}

token.getNewGenesisScript = function(scriptBuf, tokenID) {
  const newScript = Buffer.concat([
    scriptBuf.subarray(0, scriptBuf.length - TOKEN_ID_OFFSET),
    tokenID,
    scriptBuf.subarray(scriptBuf.length - proto.getHeaderLen(), scriptBuf.length)
  ])
  return newScript
}