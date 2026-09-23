FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]
COPY ["services/api-gateway/api-gateway.csproj", "services/api-gateway/"]
RUN dotnet restore "services/api-gateway/api-gateway.csproj"
COPY shared/SharedKernel/ shared/SharedKernel/
COPY services/api-gateway/ services/api-gateway/
WORKDIR "/src/services/api-gateway"
RUN dotnet build "api-gateway.csproj" -c Release -o /app/build
RUN dotnet publish "api-gateway.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "api-gateway.dll"]
