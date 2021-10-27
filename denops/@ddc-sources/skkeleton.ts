import {
  BaseSource,
  GatherCandidatesArguments,
  GetCompletePositionArguments,
  OnCompleteDoneArguments,
} from "../skkeleton/deps/ddc/source.ts";
import { Candidate } from "../skkeleton/deps/ddc/types.ts";

export type CompletionMetadata = {
  kana: string;
  word: string;
};

export class Source
  extends BaseSource<Record<string, never>, CompletionMetadata> {
  async getCompletePosition(
    args: GetCompletePositionArguments<Record<string, never>>,
  ): Promise<number> {
    const inputLength = args.context.input.length;
    const preEdit =
      (await args.denops.dispatch("skkeleton", "getPreEdit")) as string;
    const preEditLength = preEdit.length;
    return inputLength - preEditLength;
  }

  async gatherCandidates(
    args: GatherCandidatesArguments<Record<string, never>>,
  ): Promise<Candidate<CompletionMetadata>[]> {
    const candidates =
      (await args.denops.dispatch("skkeleton", "getCandidates")) as [
        string,
        string[],
      ][];
    const ddcCandidates = candidates.flatMap((e) => {
      return e[1].map((word) => ({
        word: word.replace(/;.*$/, ""),
        abbr: word,
        user_data: {
          kana: e[0],
          word,
        },
      }));
    });
    return Promise.resolve(ddcCandidates);
  }

  params() {
    return {};
  }

  async onCompleteDone(
    args: OnCompleteDoneArguments<Record<string, never>, CompletionMetadata>,
  ) {
    const meta = args.userData;
    await args.denops.dispatch(
      "skkeleton",
      "registerCandidate",
      meta.kana,
      meta.word,
    );
  }
}
