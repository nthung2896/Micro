FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]
COPY ["services/identity-service/identity-service.csproj", "services/identity-service/"]
RUN dotnet restore "services/identity-service/identity-service.csproj"
COPY shared/SharedKernel/ shared/SharedKernel/
COPY services/identity-service/ services/identity-service/
WORKDIR "/src/services/identity-service"
RUN dotnet build "identity-service.csproj" -c Release -o /app/build
RUN dotnet publish "identity-service.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5001
ENTRYPOINT ["dotnet", "identity-service.dll"]
