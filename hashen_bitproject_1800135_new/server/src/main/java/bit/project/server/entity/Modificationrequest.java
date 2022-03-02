package bit.project.server.entity;

import lombok.Data;
import java.util.List;
import javax.persistence.*;
import java.time.LocalDate;
import javax.persistence.Id;
import javax.persistence.Lob;
import java.time.LocalDateTime;
import lombok.NoArgsConstructor;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Entity
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Modificationrequest{
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    private String code;

    private LocalDate date;

    @Lob
    private String description;

    private LocalDateTime tocreation;


    @ManyToOne
    private Connection connection;

    @ManyToOne
    private Modificationrequeststatus modificationrequeststatus;

    @ManyToOne
    @JsonIgnoreProperties({"creator","status","tocreation","roleList"})
    private User creator;


    @JsonIgnore
    @OneToMany(mappedBy = "modificationrequest")
    private List<Taskallocation> modificationrequestTaskallocationList;


    public Modificationrequest(Integer id){
        this.id = id;
    }

    public Modificationrequest(Integer id, String code, Connection connection){
        this.id = id;
        this.code = code;
        this.connection = connection;
    }

}