FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]
COPY ["API/CommonHelper/CommonHelper.csproj", "API/CommonHelper/"]
COPY ["API/Hinet.Model/Hinet.Model.csproj", "API/Hinet.Model/"]
COPY ["API/Hinet.Repository/Hinet.Repository.csproj", "API/Hinet.Repository/"]
COPY ["API/Hinet.Service/Hinet.Service.csproj", "API/Hinet.Service/"]
COPY ["services/kpi-service/kpi-service.csproj", "services/kpi-service/"]

RUN dotnet restore "services/kpi-service/kpi-service.csproj"

COPY shared/SharedKernel/ shared/SharedKernel/
COPY API/CommonHelper/ API/CommonHelper/
COPY API/Hinet.Model/ API/Hinet.Model/
COPY API/Hinet.Repository/ API/Hinet.Repository/
COPY API/Hinet.Service/ API/Hinet.Service/
COPY services/kpi-service/ services/kpi-service/

WORKDIR "/src/services/kpi-service"
RUN dotnet build "kpi-service.csproj" -c Release -o /app/build
RUN dotnet publish "kpi-service.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5003
ENTRYPOINT ["dotnet", "kpi-service.dll"]
