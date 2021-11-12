const { assert } = require("chai");

const { findUser, users, findURLS } = require("../helpers.js");

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = findUser("email", "a@a.a").id;
    const expectedUserID = "asdf";
    assert.equal(user, expectedUserID);
  });

  it('should return null with an invalid email', function() {
    const user = findUser("email", "q@q.q");
    assert.equal(user, null);
  });
});