import { TileDocument } from '@ceramicnetwork/stream-tile'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'
import { DIDDataStore } from '@glazed/did-datastore'

import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import {getResolver as getKeyResolver, getResolver} from 'key-did-resolver'
import { fromString } from 'uint8arrays'
import {getResolver as get3IDResolver} from "@ceramicnetwork/3id-did-resolver";
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
// Import the model aliases created during development time
import modelAliases from '../assets/cfmodel.json'

// Create the Ceramic instance and inject the DID
const ceramic = new CeramicClient('http://localhost:7007')
//const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com")
//const ceramic = new CeramicClient("https://gateway.ceramic.network")

export function auth() {
    //const key = fromString(process.env.DID_KEY, 'base16')
    const key = fromString('ff1ca9429347cb7f922425a7b4f963eb2367d485b28cc9e405040b1a5b8e5dfb', 'base16')
    // Create and authenticate the DID
    const did = new DID({
        provider: new Ed25519Provider(key),
        resolver: getResolver(),
    })
    did.authenticate().then(r => {
        ceramic.did = did
        console.log(ceramic.did)
        return ceramic.did
    })
}

export async function getCollectedInfo() {
    // Create the model and store
    const model = new DataModel({ ceramic, aliases: modelAliases })
    const store = new DIDDataStore({ ceramic, model })
    const feeds = []
    try {
        const repos = await store.get('chainfdUserCollect')
        console.log(repos)
        for(const name in repos){
            const stream = repos[name]
            console.log(stream)
            const doc = await loadDocument(stream)
            feeds.push(doc.content)
        }
    } catch (error) {
        console.error(error);
        return 'logout'
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
    }

    return feeds
}
export async function getUsers(){
    const model = new DataModel({ ceramic, aliases: modelAliases })
    const store = new DIDDataStore({ ceramic, model })
    const users = []
    for (const user in model.aliases.tiles){
        const doc = await loadDocument(model.aliases.tiles[user])
        users.push(doc.content)
    }
    return users
}

export async function getFriends(){
    const model = new DataModel({ ceramic, aliases: modelAliases })
    const store = new DIDDataStore({ ceramic, model })
    const friends = []
    const repos = await store.get('cfFds')
    console.log(repos)
    for(const name in repos){
        const stream = repos[name]
        console.log(stream)
        const doc = await loadDocument(stream)
        friends.push(doc.content)
    }
    return friends
}

export async function addMyFriend(item) {
    const model = new DataModel({ ceramic, aliases: modelAliases })
    const store = new DIDDataStore({ ceramic, model })
    const user = await model.loadTile(item)
    console.log(user.id.toString())
    const friend = {}
    friend[item] = user.id.toString()
    await store.merge('cfFds', friend)
}

export async function clearMyFriend(name) {
    const model = new DataModel({ ceramic, aliases: modelAliases })
    const store = new DIDDataStore({ ceramic, model })
    const friends= await store.get('cfFds')
    delete friends[name]
    await store.set('cfFds', friends)
}

export async function clearALlFriends() {
    const model = new DataModel({ ceramic, aliases: modelAliases })
    const store = new DIDDataStore({ ceramic, model })
    await store.set('cfFds', {})
}

// When using extensions such as MetaMask, an Ethereum provider may be injected as `window.ethereum`
export async function tryAuthenticate() {
    if (window.ethereum == null) {
        throw new Error('No injected Ethereum provider')
    }
    const ethereumProvider = window.ethereum
    // Create a ThreeIdConnect connect instance as soon as possible in your app to start loading assets
    const threeID = new ThreeIdConnect()

    // Request accounts from the Ethereum provider
    const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts',
    })
    // Create an EthereumAuthProvider using the Ethereum provider and requested account
    const authProvider = new EthereumAuthProvider(ethereumProvider, accounts[0])
    // Connect the created EthereumAuthProvider to the 3ID Connect instance so it can be used to
    // generate the authentication secret
    await threeID.connect(authProvider)

    const did = new DID({
        // Get the DID provider from the 3ID Connect instance
        provider: threeID.getDidProvider(),
        resolver: {
            ...get3IDResolver(ceramic),
            ...getKeyResolver(),
        },
    })

    // Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
    // authentication flow using 3ID Connect and the Ethereum provider
    await did.authenticate()

    // The Ceramic client can create and update streams using the authenticated DID
    ceramic.did = did
    console.log(ceramic.did)
    return did
}


//  create tile
export async function createDocument(content, schema) {
    // The following call will fail if the Ceramic instance does not have an authenticated DID
    const doc = await TileDocument.create(ceramic, content, { schema })
    // The stream ID of the created document can then be accessed as the `id` property
    console.log(doc.id.toString())
    return doc
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

export async function collect(item) {
    // Create the model and store
    const model = new DataModel({ ceramic, aliases: modelAliases })
    const store = new DIDDataStore({ ceramic, model })
    console.log(item)
    // const schema = await TileDocument.load(ceramic, 'kjzl6cwe1jw146vt5ug8jtwb7ylub2llqb3otb1gm7mtujd0d2grwym0gw0ud29');
    // The following call will fail if the Ceramic instance does not have an authenticated DID
    const doc = await createDocument(item, 'k3y52l7qbv1frxsy7dkjgt0lrsm3biqhmj2y8geie5yac95oikxjaie4jc3pzww00')
    // The stream ID of the created document can then be accessed as the `id` property
    console.log(doc.id)
    const content = {}
    content[item.uuid] = doc.id.toString()
    await store.merge('chainfdUserCollect', content)
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


