import { Command, CommandOptions } from "commander";
declare type ICommandArgument = {
    /**
     * 参数名称, 如: appName
     */
    name: string;
    /**
     * 是否是必填项, 默认为 true
     */
    required?: boolean;
    /**
     * 参数描述
     */
    description?: string;
};
declare type ICommandSetting = {
    /**
     * 命令名称
     */
    name: string;
    /**
     * 别名
     */
    alias?: string;
    /**
     * 命令参数配置
     */
    args?: ICommandArgument[];
    commandOptions?: CommandOptions;
};
declare type IOptionArgument = {
    /**
     * 参数名称, 如: path
     */
    name: string;
    /**
     * 是否必填, 默认为 true
     */
    required?: boolean;
    /**
     * 是否是变长参数
     * 必填 <path...>
     * 非必填 [path...]
     */
    variadic?: boolean;
};
declare type IOption = {
    /**
     * 选项名称
     */
    name: string;
    /**
     * 选项名称简短表示
     */
    shortName?: string;
    /**
     * 选项参数
     */
    param?: IOptionArgument;
    /**
     * 选项是否必填, 默认为 false
     */
    required?: boolean;
    /**
     * 选项描述
     */
    description?: string;
    /**
     * 选项默认值
     */
    defaultValue?: string;
};
export declare type ActionMetaData = {
    args: string[];
    options: Record<string, string>;
};
export declare type CommandSchema = {
    /**
     * 命令配置
     */
    command: ICommandSetting;
    /**
     * 命令描述
     */
    description?: string;
    /**
     * 选项配置
     */
    options?: IOption[];
    /**
     * 处理器
     */
    action: (res: ActionMetaData) => void | Promise<void>;
    /**
     * 子命令
     */
    subCommands?: CommandSchema[];
};
declare type Enhancer = (name: string, cmd: Command) => void;
/**
 * 返回 新的 command, 可以使用 addCommand 方法在任意命令直接进行主子链接
 * @param program
 * @param config
 * @param enhancer
 * @returns
 */
declare const createCommand: (config: CommandSchema, enhancer?: Enhancer) => Command;
export { createCommand, Command };
