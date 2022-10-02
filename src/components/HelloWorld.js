import { TileDocument } from '@ceramicnetwork/stream-tile'
import { CeramicClient } from '@ceramicnetwork/http-client'

import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays'


//const key = fromString(process.env.DID_KEY, 'base16')
const key = fromString('ff1ca9429347cb7f922425a7b4f963eb2367d485b28cc9e405040b1a5b8e5dfb', 'base16')
// Create and authenticate the DID
const did = new DID({
    provider: new Ed25519Provider(key),
    resolver: getResolver(),
})
// Create the Ceramic instance and inject the DID
//const ceramic = new CeramicClient('http://localhost:7007')
const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com")
//const ceramic = new CeramicClient("https://gateway.ceramic.network")

export function auth() {
    did.authenticate().then(r => {
        ceramic.did = did
        console.log(ceramic.did)
        return ceramic.did
    })
}

//  create tile
export function createDocument(content) {
    // The following call will fail if the Ceramic instance does not have an authenticated DID
    return TileDocument.create(ceramic, content)
}
//  update tile
export function updateDocument(id, content) {
    // First, we need to load the document
    const doc =  TileDocument.load(ceramic, id)
    // The following call will fail if the Ceramic instance does not have an authenticated DID
    console.log("update to --------> " + content)
    doc.update(content)
}

export function loadDocument(id){
    const loadDoc = ceramic.loadStream(id)

    return loadDoc
}

export function createSchema(){
    const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Reward",
        "type": "object",
        "properties": {
            "title": { "type": "string" },
            "message": { "type": "string" }
        },
        "required": [
            "message",
            "title"
        ]
    }
    const metadata = {controllers: [ceramic.did.id] } // this will set yourself as the controller of the schema
    const rewardSchema = TileDocument.create(ceramic, schema, metadata)
    console.log(rewardSchema.commitId)
    return rewardSchema
}

export function createUseSchema(schemaId){
    const reward = TileDocument.create(ceramic, {
        title: 'Hello',
        message: 'world!'
    }, {
        controllers: [ceramic.did.id],
        family: 'Rewards',
        schema: schemaId,
    })
    console.log(reward.id.toString())
}

export function pin(streamId){
    ceramic.pin.add(streamId)
}
//await createDocument('{"hello world": "feedChain","author": "admin", "other":"hahahah2222"}')
//await updateDocument('kjzl6cwe1jw149g31a14dwi85n6wd51ikvpx3m709ejcfxrshvuo6g4ou6xmu0d', '{"hello111": "update feedChain 1111"}')
// const doc = await loadDocument('kjzl6cwe1jw147jx2oie8zvmutyeu7appqezfbt56qc16wllmqoy8p107x0syno')
// console.log(doc.state$.state$._value)
// console.log(doc.content)
//await pin('kjzl6cwe1jw147k42tpyix1zhvjjr0djg55qhgm40u33lu7ho7rv0aeraombj1q')
//createSchema()
//await createUseSchema('k3y52l7qbv1frxochxwnmcuc2fakn40jqozywc8pcngq4slpyv0nlqgrnaww760ow')
//console.log(doc.state)


