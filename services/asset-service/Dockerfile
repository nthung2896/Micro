FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]
COPY ["services/asset-service/CommonHelper/CommonHelper.csproj", "services/asset-service/CommonHelper/"]
COPY ["services/asset-service/Hinet.Model/Hinet.Model.csproj", "services/asset-service/Hinet.Model/"]
COPY ["services/asset-service/Hinet.Repository/Hinet.Repository.csproj", "services/asset-service/Hinet.Repository/"]
COPY ["services/asset-service/Hinet.Service/Hinet.Service.csproj", "services/asset-service/Hinet.Service/"]
COPY ["services/asset-service/Hinet.Api/Hinet.Api.csproj", "services/asset-service/Hinet.Api/"]

RUN dotnet restore "services/asset-service/Hinet.Api/Hinet.Api.csproj"

COPY shared/SharedKernel/ shared/SharedKernel/
COPY services/asset-service/ services/asset-service/

WORKDIR "/src/services/asset-service/Hinet.Api"
RUN dotnet build "Hinet.Api.csproj" -c Release -o /app/build
RUN dotnet publish "Hinet.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5005
ENTRYPOINT ["dotnet", "Hinet.Api.dll"]
