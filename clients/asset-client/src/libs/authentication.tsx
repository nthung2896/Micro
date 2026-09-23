import { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

function withAuthorization<T extends object>(
  WrappedComponent: ComponentType<T>,
  requiredCode: string,
) {
  const WithAuthWrapper = (props: T) => {
    const router = useRouter();

    const menuData: any | null = useSelector(
      (state: any) => state.menu.menuData,
    );
    const listOperation = menuData
      ? menuData.flatMap((menu: any) =>
          menu.listMenu
            .filter((item: any) => item.isAccess == true)
            .map((item: any) => item.code),
        )
      : [];

    if (!menuData) return null;
    // if (
    //   requiredCode != "" &&
    //   (!listOperation || !listOperation.includes(requiredCode))
    // ) {
    //   router.push("/unauthorized");
    //   return null;
    // }
    return <WrappedComponent {...props} />;
  };

  WithAuthWrapper.displayName = `WithAuthorization(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  return WithAuthWrapper;
}

export default withAuthorization;
