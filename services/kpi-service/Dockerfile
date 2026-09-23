FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]
COPY ["services/kpi-service/CommonHelper/CommonHelper.csproj", "services/kpi-service/CommonHelper/"]
COPY ["services/kpi-service/Hinet.Model/Hinet.Model.csproj", "services/kpi-service/Hinet.Model/"]
COPY ["services/kpi-service/Hinet.Repository/Hinet.Repository.csproj", "services/kpi-service/Hinet.Repository/"]
COPY ["services/kpi-service/Hinet.Service/Hinet.Service.csproj", "services/kpi-service/Hinet.Service/"]
COPY ["services/kpi-service/Hinet.Api/Hinet.Api.csproj", "services/kpi-service/Hinet.Api/"]

RUN dotnet restore "services/kpi-service/Hinet.Api/Hinet.Api.csproj"

COPY shared/SharedKernel/ shared/SharedKernel/
COPY services/kpi-service/ services/kpi-service/

WORKDIR "/src/services/kpi-service/Hinet.Api"
RUN dotnet build "Hinet.Api.csproj" -c Release -o /app/build
RUN dotnet publish "Hinet.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5003
ENTRYPOINT ["dotnet", "Hinet.Api.dll"]
