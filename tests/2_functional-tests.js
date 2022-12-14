const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
let _id;

  test('#1 Create an issue with every field: POST', function(done){
    chai.request(server)
    .post('/api/issues/apitest')
    .send({issue_title: "webpage crashed",
           issue_text: "internal error occured",
           created_by: "pk",
           assigned_to: "senior dev",
           status_text: "not ok"
          })
    .end((req, res) => {
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal("senior dev", res.body.assigned_to);
      assert.equal("not ok", res.body.status_text);
      assert.equal(true, res.body.open);
      assert.equal("webpage crashed", res.body.issue_title);
      assert.equal((new Date()).getDay, (new Date(res.body.created_on)).getDay );

      _id = res.body._id;

      done()
    })
  })

  test('#2 Create an issue with only required fields: POST', function(done){
    chai.request(server)
    .post('/api/issues/apitest')
    .send({issue_title: "webpage crashed",
           issue_text: "internal error occured",
           created_by: "pk",
          })
    .end((req, res) => {
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal(true, res.body.open);
      assert.equal("webpage crashed", res.body.issue_title);
      assert.equal((new Date()).getDay, (new Date(res.body.created_on)).getDay );

      done()
    })
  })

  test('#3 Create an issue with missing required fields: POST', function(done){
    chai.request(server)
    .post('/api/issues/apitest')
    .send({issue_title: "webpage crashed",
           issue_text: "internal error occured"
          })
    .end((req, res) => {
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal("required field(s) missing", res.body.error);

      done()
    })
  })

  test('#4 View issues on a project: GET', function(done){
    chai.request(server)
    .get('/api/issues/apitest')
    .end((req, res) => {
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.notEqual(0, res.body.length);

      done()
    })
  })

  test('#5 View issues on a project with one filter: GET', function(done){
    chai.request(server)
    .get('/api/issues/apitest?open=true')
    .end((req, res) => {
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.notEqual(0, res.body.length);

      done()
    })
  })

  test('#6 View issues on a project with multiple filter: GET', function(done){
    chai.request(server)
    .get('/api/issues/fcc-project?open=true&created_by=fCC')
    .end((req, res) => {
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.notEqual(0, res.body.length);

      done()
    })
  })

  test('#7 Update one field on an issue: PUT', function(done){
    chai.request(server)
    .put('/api/issues/fcc-project')
    .send({"_id": _id, issue_text: "it takes time"})
    .end((req,res) =>{
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal("successfully updated", res.body.result);
      // console.log(res.body);

      done();
    })
  })

  test('#8 Update multiple fields on an issue: PUT', function(done){
    chai.request(server)
    .put('/api/issues/fcc-project')
    .send({"_id": _id, issue_text: "it takes time", assigned_to: "senior dev"})
    .end((req,res) =>{
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal("successfully updated", res.body.result);

      done()
    })
  })

  test('#9 Update an issue with missing _id: PUT', function(done){
    chai.request(server)
    .put('/api/issues/fcc-project')
    .end((req,res) =>{
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal('missing _id', res.body.error);

      done()
    })
  })

  test('#10 Update an issue with no fields to update: PUT', function(done){
    chai.request(server)
    .put('/api/issues/fcc-project')
    .send({_id: _id})
    .end((req,res) =>{
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal('no update field(s) sent', res.body.error);

      done()
    })
  })

  test('#11 Update an issue with an invalid _id: PUT', function(done){
    chai.request(server)
    .put('/api/issues/fcc-project')
    .send({_id: "5fb5a463964b9954ecc01ae0", issue_title: "checking with invalid _id"})
    .end((req,res) =>{
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal('could not update', res.body.error);

      done()
    })
  })


  test('#12 Delete an issue: DELETE', function(done){
    chai.request(server)
    .delete('/api/issues/apitest')
    .send({_id: _id})
    .end((req, res) => {
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal("successfully deleted", res.body.result);

      done()
    })
  })

  test('#13 Delete an issue with an invalid _id: DELETE', function(done){
    chai.request(server)
    .delete('/api/issues/apitest')
    .send({_id: '6399674745asfsadfafafaasf'})
    .end((req, res) => {
      assert.equal(500, res.status);

      done()
    })
  })

  test('#14 Delete an issue with an missing _id: DELETE', function(done){
    chai.request(server)
    .delete('/api/issues/apitest')
    .send({_id: '6399e711d64d9be102430bb7'})
    .end((req, res) => {
      assert.equal(200, res.status);
      assert.equal("application/json", res.type);
      assert.equal("missing _id", res.body.error);

      done()
    })
  })
});
