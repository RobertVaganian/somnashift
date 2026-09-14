# Third-party notices

The project license applies to SomnaShift’s original source, branding and interface. The assets below retain their own licenses and copyright notices.

## Included fonts

| Asset | Source | License shipped with this project |
| --- | --- | --- |
| Source Sans 3 Latin variable font | [Google Fonts / Source Sans 3](https://github.com/google/fonts/tree/main/ofl/sourcesans3) | [SIL Open Font License](dist/fonts/SourceSans3-OFL.txt) |
| Newsreader Latin variable font | [Google Fonts / Newsreader](https://github.com/google/fonts/tree/main/ofl/newsreader) | [SIL Open Font License](dist/fonts/Newsreader-OFL.txt) |

The font license files contain the original copyright notices. They are distributed beside the font files.

## Optional local-search dependencies

These assets are downloaded from their upstream hosts after the user explicitly loads local search. They are not vendored into this repository or its source archive.

| Dependency | Pinned source | Upstream license |
| --- | --- | --- |
| Transformers.js | `@huggingface/transformers@3.8.1/dist/transformers.min.js` on jsDelivr | [Apache-2.0](https://github.com/huggingface/transformers.js/blob/3.8.1/LICENSE) |
| ONNX Runtime Web | Runtime assets referenced by the pinned Transformers.js distribution | [MIT](https://github.com/microsoft/onnxruntime/blob/main/LICENSE), with [upstream third-party notices](https://github.com/microsoft/onnxruntime/blob/main/ThirdPartyNotices.txt) |
| MiniLM quantized ONNX model | `Xenova/all-MiniLM-L6-v2`, revision `751bff37182d3f1213fa05d7196b954e230abad9` | [Model card and Apache-2.0 license declaration](https://huggingface.co/Xenova/all-MiniLM-L6-v2/tree/751bff37182d3f1213fa05d7196b954e230abad9) |

The model export derives from [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). Upstream licenses and notices continue to apply to runtime downloads. If vendoring those dependencies, include their required licenses and notices with the redistributed files.

See [local search](docs/on-device-search.md) for download behavior and processing scope.
