package com.abhinand.handrill;

import com.abhinand.handrill.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class HandrillApplication {
    public static void main(String[] args) {
        SpringApplication.run(HandrillApplication.class, args);
    }
}
