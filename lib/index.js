"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.createCommand = void 0;
var commander_1 = require("commander");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return commander_1.Command; } });
var handlerCommand = function (commandSetting) {
    var name = commandSetting.name, _a = commandSetting.args, args = _a === void 0 ? [] : _a, alias = commandSetting.alias;
    var cmd = new commander_1.Command(name)
        /**
         * 避免主子命令选项名冲突
         * 可以在命令和子命令中使用意义不同的同名选项
         */
        .enablePositionalOptions()
        /**
         * 不允许传入过多的参数
         */
        .allowExcessArguments(false);
    if (alias) {
        cmd = cmd.alias(alias);
    }
    for (var i = 0; i < args.length; i++) {
        var _b = args[i], name_1 = _b.name, _c = _b.required, required = _c === void 0 ? true : _c, description = _b.description;
        var template = required ? "<".concat(name_1, ">") : "[".concat(name_1, "]");
        cmd = cmd.argument(template, description);
    }
    return cmd;
};
var handlerOptions = function (program, options) {
    var cmd = program;
    var getFlag = function (name, shortName, param) {
        var nameFlag = shortName ? "-".concat(shortName, ", --").concat(name) : "--".concat(name);
        if (!param) {
            return nameFlag;
        }
        else {
            var paramName = param.name, _a = param.required, required = _a === void 0 ? true : _a, variadic = param.variadic;
            var flag = "".concat(paramName).concat(variadic ? "..." : "");
            var paramFlag = required ? "<".concat(flag, ">") : "[".concat(flag, "]");
            return "".concat(nameFlag).concat(paramFlag ? " " + paramFlag : "");
        }
    };
    for (var i = 0; i < options.length; i++) {
        var _a = options[i], name_2 = _a.name, shortName = _a.shortName, param = _a.param, description = _a.description, required = _a.required, defaultValue = _a.defaultValue;
        var flags = getFlag(name_2, shortName, param);
        if (required) {
            cmd = cmd.requiredOption(flags, description, defaultValue);
        }
        else {
            cmd = cmd.option(flags, description, defaultValue);
        }
    }
    return cmd;
};
/**
 * 返回 新的 command, 可以使用 addCommand 方法在任意命令直接进行主子链接
 * @param program
 * @param config
 * @param enhancer
 * @returns
 */
var createCommand = function (config, enhancer) {
    var command = config.command, description = config.description, _a = config.options, options = _a === void 0 ? [] : _a, action = config.action, subCommands = config.subCommands;
    var cmd = handlerCommand(command);
    if (description) {
        cmd = cmd.description(description);
    }
    cmd = handlerOptions(cmd, options);
    cmd = cmd.action(function () {
        action({
            args: cmd.processedArgs,
            options: cmd.opts(),
        });
    });
    /**
     * 提供配置不适应场景下的增强器
     */
    if (enhancer) {
        enhancer(cmd.name(), cmd);
    }
    /**
     * 命中子命令，只会触发子命令的 action
     */
    if (subCommands) {
        for (var i = 0; i < subCommands.length; i++) {
            var subCommandSchema = subCommands[i];
            var sumCmd = createCommand(subCommandSchema, enhancer);
            cmd.addCommand(sumCmd, subCommandSchema.command.commandOptions);
        }
    }
    return cmd;
};
exports.createCommand = createCommand;
