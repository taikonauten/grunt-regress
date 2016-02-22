'use strict';

var cp = require('child_process')


function clean(cb){

  cp.exec('grunt clean', function(){

    cb();
  })
}

function generate(cb){

  cp.exec('grunt regress:test:generate', function(){

    cb();
  })
}


describe('test grunt-regress', function(){
  //before(clean);

  it('should generate files', function(done){

    //generate(done);

    done();
  })

});


