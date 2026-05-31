export type NetworkAddress = {
  name: string;
  address: string;
};

export type NetworkInfo = {
  hostname: string;
  port: number;
  addresses: NetworkAddress[];
  primaryAddress: string | null;
  localUrl: string;
  inviteUrl: string | null;
  mode: "server" | "browser";
};
