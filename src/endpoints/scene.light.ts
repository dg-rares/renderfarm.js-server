import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, IDatabase, IChecks, IMaxscriptClientFactory } from "../interfaces";
import { TYPES } from "../types";

@injectable()
class SceneLightEndpoint implements IEndpoint {
    private _database: IDatabase;
    private _checks: IChecks;
    private _maxscriptClientFactory: IMaxscriptClientFactory;

    constructor(@inject(TYPES.IDatabase) database: IDatabase,
                @inject(TYPES.IChecks) checks: IChecks,
                @inject(TYPES.IMaxscriptClientFactory) maxscriptClientFactory: IMaxscriptClientFactory) {
        this._database = database;
        this._checks = checks;
        this._maxscriptClientFactory = maxscriptClientFactory;
    }

    bind(express: express.Application) {
        express.get('/scene/:sceneid/light', async function (req, res) {
            console.log(`GET on /scene/${req.params.sceneid}/light with session: ${req.body.session}`);
            res.end({});
        }.bind(this));

        express.get('/scene/:sceneid/light/:uid', async function (req, res) {
            console.log(`GET on /scene/${req.params.sceneid}/light/${req.params.uid} with session: ${req.body.session}`);
            res.end({});
        }.bind(this));

        express.post('/scene/:sceneid/skylight', async function (req, res) {
            console.log(`POST on /scene/${req.params.sceneid}/skylight with session: ${req.body.session}`);

            this._database.getWorker(req.body.session)
                .then(function(worker){

                    let maxscriptClient = this._maxscriptClientFactory.create();
                    maxscriptClient.connect(worker.ip)
                        .then(function(value) {
                            console.log("SceneLightEndpoint connected to maxscript client, ", value);

                            let skylightJson = {
                                name: require('../utils/genRandomName')("skylight"),
                                position: [12,0,17]
                            };

                            maxscriptClient.createSkylight(skylightJson)
                                .then(function(value) {
                                    maxscriptClient.disconnect();
                                    console.log(`    OK | skylight created`);
                                    res.end(JSON.stringify({ id: skylightJson.name }, null, 2));
                                }.bind(this))
                                .catch(function(err) {
                                    maxscriptClient.disconnect();
                                    console.error(`  FAIL | failed to create skylight\n`, err);
                                    res.status(500);
                                    res.end(JSON.stringify({ error: "failed to create skylight" }, null, 2));
                                }.bind(this)); // end of maxscriptClient.createSkylight promise
            
                        }.bind(this))
                        .catch(function(err) {
                            console.error("SceneLightEndpoint failed to connect to maxscript client, ", err);
                        }.bind(this)); // end of maxscriptClient.connect promise

                }.bind(this))
                .catch(function(err){
                    res.end(JSON.stringify({ error: "session is expired" }, null, 2));
                }.bind(this)); // end of this._database.getWorker promise
    
        }.bind(this));

        express.post('/scene/:sceneid/spotlight', async function (req, res) {
            console.log(`POST on /scene/${req.params.sceneid}/spotlight with session: ${req.body.session}`);

            this._database.getWorker(req.body.session)
                .then(function(worker){

                    let maxscriptClient = this._maxscriptClientFactory.create();
                    maxscriptClient.connect(worker.ip)
                        .then(function(value) {
                            console.log("SceneLightEndpoint connected to maxscript client, ", value);

                            const LZString = require("lz-string");
                            let spotlightJsonText = LZString.decompressFromBase64(req.body.spotlight);
                            let spotlightJson: any = JSON.parse(spotlightJsonText);

                            spotlightJson.name = require('../utils/genRandomName')("spotlight");

                            console.log(" >> spotlightJson: ", spotlightJson);

                            maxscriptClient.createSpotlight(spotlightJson)
                                .then(function(value) {
                                    maxscriptClient.disconnect();
                                    console.log(`    OK | spotlightJson created`);
                                    res.end(JSON.stringify({ id: spotlightJson.name }, null, 2));
                                }.bind(this))
                                .catch(function(err) {
                                    maxscriptClient.disconnect();
                                    console.error(`  FAIL | failed to create spotlightJson\n`, err);
                                    res.status(500);
                                    res.end(JSON.stringify({ error: "failed to create spotlightJson" }, null, 2));
                                }.bind(this)); // end of maxscriptClient.createSpotlight promise
            
                        }.bind(this))
                        .catch(function(err) {
                            console.error("SceneLightEndpoint failed to connect to maxscript client, ", err);
                        }.bind(this)); // end of maxscriptClient.connect promise

                }.bind(this))
                .catch(function(err){
                    res.end(JSON.stringify({ error: "session is expired" }, null, 2));
                }.bind(this)); // end of this._database.getWorker promise
    
        }.bind(this));

        express.put('/scene/:sceneid/light/:uid', async function (req, res) {
            console.log(`PUT on /scene/${req.params.sceneid}/light/${req.params.uid} with session: ${req.body.session}`);
            res.end({});
        }.bind(this));

        express.delete('/scene/:sceneid/light/:uid', async function (req, res) {
            console.log(`DELETE on /scene/${req.params.sceneid}/light/${req.params.uid} with session: ${req.body.session}`);
            res.end({});
        }.bind(this));
    }
}

export { SceneLightEndpoint };