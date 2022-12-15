declare namespace browser.scripting {
	export type ExecutionWorld = 'ISOLATED' | 'MAIN';
	export interface InjectionResult<T> {
		frameId: number;
		result: T;
	}
	export interface InjectionTarget {
		allFrames?: boolean | undefined;
		frameIds?: number[] | undefined;
		tabId: number;
	}
	export type ScriptInjection<Args extends any[], Result> = {
		target: InjectionTarget;
		world?: ExecutionWorld;
		injectImmediately?: boolean;
	} & ({
		files: string[];
	} | ({
		func: () => Result;
	}  | {
		func: (...args: Args) => Result;
		args: Args;
	}))

	type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

	export function executeScript<Args extends any[], Result>(injection: ScriptInjection<Args, Result>): Promise<InjectionResult<Awaited<Result>>[]>;
}
