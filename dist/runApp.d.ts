import 'bootstrap';
import { InferType } from 'yup';
declare module 'yup' {
    interface ArraySchema<T, C> {
        unique(message: string, mapper: (a: C) => C[keyof C]): ArraySchema<T>;
    }
}
declare const feedSchema: import("yup/lib/object").OptionalObjectSchema<{
    url: import("yup/lib/string").RequiredStringSchema<string | undefined, import("yup/lib/types").AnyObject>;
}, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<{
    url: import("yup/lib/string").RequiredStringSchema<string | undefined, import("yup/lib/types").AnyObject>;
}>>;
export declare const feedsSchema: import("yup").ArraySchema<import("yup/lib/object").OptionalObjectSchema<{
    url: import("yup/lib/string").RequiredStringSchema<string | undefined, import("yup/lib/types").AnyObject>;
}, import("yup/lib/object").AnyObject, import("yup/lib/object").TypeOfShape<{
    url: import("yup/lib/string").RequiredStringSchema<string | undefined, import("yup/lib/types").AnyObject>;
}>>, import("yup/lib/types").AnyObject, import("yup/lib/object").TypeOfShape<{
    url: import("yup/lib/string").RequiredStringSchema<string | undefined, import("yup/lib/types").AnyObject>;
}>[] | undefined, import("yup/lib/object").AssertsShape<{
    url: import("yup/lib/string").RequiredStringSchema<string | undefined, import("yup/lib/types").AnyObject>;
}>[] | undefined>;
export interface AddingFeed extends InferType<typeof feedSchema> {
}
export interface Feed {
    url: AddingFeed['url'];
    title: string;
    description: string;
    id: string;
}
export interface Post {
    id: string;
    title: string;
    description: string;
    url: string;
}
export interface AppState {
    feed: {
        addingProcess: {
            state: 'idle' | 'validating' | 'loading' | 'parsing';
            errors: string[];
        };
        validatingProcess: {
            state: 'idle' | 'invalid' | 'valid';
        };
        loadingProcess: {
            state: 'idle' | 'started' | 'loaded' | 'error';
        };
        parsingProcess: {
            state: 'idle' | 'started' | 'error';
        };
        updatingProcess: {
            state: 'idle' | 'started';
        };
        feeds: Feed[];
        posts: Post[];
    };
    uiState: {
        readPosts: Set<string>;
    };
}
export interface AppRenderElements {
    addingFormFeedbackElement: HTMLElement;
    addingFormElement: HTMLFormElement;
    addingFormInputElement: HTMLInputElement;
    addingFormSubmitButtonElement: HTMLButtonElement;
    postsContainerElement: HTMLDivElement;
    feedsContainerElement: HTMLDivElement;
}
declare const _default: () => void;
export default _default;
