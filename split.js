/**
 * Created by ganara.jpermunda on 29/07/2014.
 */
var _, getFuncName, prg, create, addToFunction, $_coreobject_$;
_ = {
    first: function () {
        return 1;
    },
    rest: function () {
        return 1;
    }
};
getFuncName = function () {
    return 1;
};
prg = {
    addVariable: function () {
        return 1;
    },
    getAssignment: function () {
        return {
            right:{
                type : 'FunctionExpression'
            }
        };
    },
    addAssignment: function () {
        return 1;
    }
};
create = {
    FunctionExpression: 1,
    Identifier: 1,
    Literal: 1
};
addToFunction = function () {
    return 1;
};
$_coreobject_$ = {
    //sequencer
    handleFirstFunction: function handleFirstFunction(parts) {
        'use strict';
        var identifier;
        //pure
        var first = _.first(parts);
        //pure
        identifier = getFuncName(first);
        //do
        prg.addVariable(identifier);
        //do
        this.branchOnPartsLengthGreaterThanOneOrNot(parts,identifier);
    },
    //switcher
    branchOnPartsLengthGreaterThanOneOrNot : function(parts,identifier){
        //do
        if (parts.length > 1) {
            this.whenMoreThanOneParts(parts,identifier);
        } else {
            this.whenOnePart(parts,identifier);
        }
    },

    //switcher
    whenMoreThanOneParts : function(parts,identifier){

        //pure
        var idassign = prg.getAssignment(identifier);
        this.branchOnExistanceOfAssignment()
        //do
        if (!idassign) {
            this.whenNoAssignment(parts,identifier);
        } else {
            if (idassign.right.type === 'FunctionExpression') {
                addToFunction(idassign.right, _.rest(parts));
            }
        }
    },

    //sequencer
    whenOnePart:function(parts,identifier){

        var funct = new create.FunctionExpression();
        funct.addReturn(new create.Literal(1));

        //do
        prg.addAssignment(new create.Identifier(identifier), funct);
    },


    branchOnExistanceOfAssignment:function(idassign,parts){
        if(!idassign){
            this.whenNoAssignment(parts);
        }
        else{
            this.branchOnAssignmentRightType(idassign.right,parts);
        }
    },

    branchOnAssignmentRightType : function(assignmentRight,parts){
        if(assignmentRight.type === 'FunctionExpression'){
            addToFunction(idassign.right, _.rest(parts));
        }
    },


    whenNoAssignment : function(parts){
        var newfe = new create.FunctionExpression();
        prg.addAssignment(new create.Identifier(identifier), newfe);
        addToFunction(newfe, _.rest(parts));
    }

};

$_coreobject_$.handleFirstFunction(['console','log()']);