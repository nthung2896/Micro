FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]
COPY ["services/room-service/room-service.csproj", "services/room-service/"]
RUN dotnet restore "services/room-service/room-service.csproj"
COPY shared/SharedKernel/ shared/SharedKernel/
COPY services/room-service/ services/room-service/
WORKDIR "/src/services/room-service"
RUN dotnet build "room-service.csproj" -c Release -o /app/build
RUN dotnet publish "room-service.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5002
ENTRYPOINT ["dotnet", "room-service.dll"]
