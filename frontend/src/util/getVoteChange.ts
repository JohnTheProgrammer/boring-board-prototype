export const getVoteChange = (
  prev: -1 | 0 | 1,
  next: -1 | 1,
): { modifier: number; newVote: 0 | 1 | -1 } => {
  const table = {
    "-1": {
      "-1": { modifier: 1, newVote: 0 },
      "1": { modifier: 2, newVote: 1 },
    },
    "0": {
      "-1": { modifier: -1, newVote: -1 },
      "1": { modifier: 1, newVote: 1 },
    },
    "1": {
      "1": { modifier: -1, newVote: 0 },
      "-1": { modifier: -2, newVote: -1 },
    },
  };
  return table[prev][next] as { modifier: number; newVote: 0 | 1 | -1 };
};
