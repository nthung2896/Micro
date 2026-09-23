import NotificationServiceGenerated from "../generated/notificationService.generated";

class NotificationService extends NotificationServiceGenerated {
  private static _instance: NotificationService;

  public static get instance(): NotificationService {
    if (!NotificationService._instance) {
      NotificationService._instance = new NotificationService();
    }
    return NotificationService._instance;
  }
}

const notificationService = NotificationService.instance;
export default notificationService;
