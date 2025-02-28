FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /src

COPY . ./

WORKDIR /src/packages/demo/orchestrated/readmodel-dotnet

EXPOSE 8080

CMD ["dotnet", "watch", "run", "--non-interactive"]
