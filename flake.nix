{
  description = "Description for the project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit self; } {
      systems = [ "x86_64-linux" "aarch64-darwin" "x86_64-darwin" ];
      perSystem = {  pkgs, ... }: with pkgs;{
        devShells.default = mkShell {
          buildInputs = [
            nodejs-18_x
            nodePackages.pnpm
           ];
        };
      };
    };
}
