/** eSpeak NG compiled to WebAssembly (the espeak-ng package): a tool of npm run sounds:build only. */
declare module "espeak-ng" {
  interface ESpeakNgOptions {
    arguments: string[];
    print?: (message: string) => void;
    printErr?: (message: string) => void;
  }
  interface ESpeakNgInstance {
    FS: { readFile(path: string): Uint8Array };
  }
  const ESpeakNg: (options: ESpeakNgOptions) => Promise<ESpeakNgInstance>;
  export default ESpeakNg;
}
