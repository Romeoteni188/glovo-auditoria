{
  description = "Simple flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      # Helper function to create a shell for different architectures
      makeDevShell =
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config.allowUnfree = true;
          };

          # Function to create script
          mkScript =
            name: text:
            let
              script = pkgs.writeShellScriptBin name text;
            in
            script;

          scripts = [ ];

        in
        pkgs.mkShell {

          nativeBuildInputs = scripts;

          buildInputs = [
            pkgs.nodejs
            pkgs.pnpm
            pkgs.typescript-language-server
            pkgs.nodePackages.prettier
            pkgs.libwebp
          ];
        };
    in
    {
      devShells."aarch64-darwin".default = makeDevShell "aarch64-darwin";
      devShells."x86_64-linux".default = makeDevShell "x86_64-linux";
      devShells."x86_64-darwin".default = makeDevShell "x86_64-darwin";
    };
}
