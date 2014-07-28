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
        return 1;
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
    handleFirstFunction: function handleFirstFunction(parts) {
        'use strict';
        var identifier;
        var first = _.first(parts);
        identifier = getFuncName(first);
        prg.addVariable(identifier);
        if (parts.length > 1) {
            var idassign = prg.getAssignment(identifier);
            if (!idassign) {
                var newfe = new create.FunctionExpression();
                prg.addAssignment(new create.Identifier(identifier), newfe);
                addToFunction(newfe, _.rest(parts));
            } else {
                if (idassign.right.type === 'FunctionExpression') {
                    addToFunction(idassign.right, _.rest(parts));
                }
            }
        } else {
            var funct = new create.FunctionExpression();
            funct.addReturn(new create.Literal(1));
            prg.addAssignment(new create.Identifier(identifier), funct);
        }
    }
};

$_coreobject_$.handleFirstFunction(['console','log()']);