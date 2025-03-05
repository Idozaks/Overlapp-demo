{navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link to={item.href} className="block">
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent hover:bg-background/10"
                      )}
                    >
                      {t(item.label)}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <Link to="/events" className="block">
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-background/10"
                    )}
                  >
                    {t('navigation.events', 'Events')}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>